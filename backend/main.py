from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import re
import requests
import base64
from dotenv import load_dotenv
from google import genai
from google.genai import types
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np


app = FastAPI()

origins = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


user_knowledge_bases = {}
user_vector_stores = {}

embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

def get_repo_details(repositoryUrl, token):
    pattern = r"github\.com/([^/]+)/([^/]+)"
    match = re.search(pattern, repositoryUrl)
    if not match:
        raise ValueError("Invalid GitHub repository URL.")
    owner = match.group(1)
    repo = match.group(2).replace(".git", "")
    headers = {"Authorization": f"token {token}"} if token else {}
    repo_api_url = f"https://api.github.com/repos/{owner}/{repo}"
    print(repo_api_url)
    repo_response = requests.get(repo_api_url, headers=headers)
    if repo_response.status_code != 200:
        raise Exception(f"Failed to fetch repository info: {repo_response.status_code} {repo_response.text}")
    repo_data = repo_response.json()
    default_branch = repo_data.get("default_branch", "master")
    return owner, repo, default_branch

def get_repo_tree(owner, repo, branch, token):
    headers = {"Authorization": f"token {token}"} if token else {}
    url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1"
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        raise Exception("Failed to fetch repository tree")
    tree_data = response.json()
    files = [item for item in tree_data.get("tree", []) if item["type"] == "blob"]
    return files

def fetch_file_content(owner, repo, file_path, default_branch, token):
    headers = {"Authorization": f"token {token}"} if token else {}
    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{file_path}?ref={default_branch}"
    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"Failed to fetch content for {file_path}: {response.status_code}")
        return None
    data = response.json()
    if data.get("encoding") == "base64":
        try:
            content = base64.b64decode(data["content"]).decode('utf-8', errors='ignore')
        except Exception as e:
            print(f"Error decoding content for {file_path}: {e}")
            return None
        print("Content fetched successfully")
        return content
    else:
        return data.get("content")

def build_vector_store(chunks):
    embeddings = embedding_model.encode(chunks)
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(np.array(embeddings, dtype=np.float32))
    return index, chunks

def retrieve_all_chunks(vector_store):
    return vector_store["chunks"]


@app.post("/generate_documentation")
def generate_documentation(repositoryUrl: str, userEmail: str):
    try:
        load_dotenv()
        token = os.getenv("GITHUB_TOKEN")
        owner, repo, default_branch = get_repo_details(repositoryUrl, token)
        files = get_repo_tree(owner, repo, default_branch, token)
        
        user_knowledge_bases[userEmail] = {}
        all_chunks = []

        for item in files:
            file_path = item["path"]
            exclude_patterns = ["node_modules", ".github", ".git", "venv", "dist", "build", ".gitignore", "main.py"]
            if any(pattern in file_path for pattern in exclude_patterns):
                continue
            content = fetch_file_content(owner, repo, file_path, default_branch, token)
            if content:
                user_knowledge_bases[userEmail][file_path] = content
                chunk = f"\n# File: {file_path}\n{content}\n"
                all_chunks.append(chunk)
            else:
                user_knowledge_bases[userEmail][file_path] = "(Content not Fetched)"

        index, mapping_chunks = build_vector_store(all_chunks)
        user_vector_stores[userEmail] = {"index": index, "chunks": mapping_chunks}

        print("Knowledge base and vector store created for the user.")
        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
        client = genai.Client(api_key=GEMINI_API_KEY)

        vector_store = user_vector_stores.get(userEmail)

        if not vector_store:
            return {"status": "error", "message": "Knowledge base not found for user."}
        
        all_chunks = retrieve_all_chunks(vector_store)
        context = "\n".join(all_chunks)

        base_prompt = """Analyze the following multi-language codebase along with any existing documentation provided, and generate comprehensive documentation formatted as a Markdown file. The output must be in valid Markdown and include the following sections:

        Overall Overview:

        A summary of the project's goals and architectural structure.
        An explanation of how different languages or modules interact.

        File/Module-Level Details:
        List each file or module along with its programming language.
        Provide a brief description of its functionality and role within the project.
        Highlight any notable patterns, design decisions, or dependencies.

        Key Functions and Components:
        Offer detailed explanations of major functions, classes, or components.
        Describe how these elements contribute to the project's objectives.

        Implementation Details:
        Give an overview of error handling strategies, file structure conventions, and data flows.
        Include specific details for clarity where necessary.

        Visual Diagrams:
        Flowcharts: Use mermaid.js syntax in Markdown code blocks to represent control flows, data flows, or architectural structures. Draw diagrams to illustrate the project's logic and organization.
        Draw end to end data flow, give as many flow charts as possible. Instead of using typical terms like Handle Error, Response, etc, use the actual function name. Make all flowcharts horizontal, clean and error free, like don't use () in [] in mermaid.js. It should loook like good diagrams which a developer can understand easily make it like a block diagrams.
        Sequence Diagrams: Create sequence diagrams using mermaid.js in Markdown code blocks to show interactions between different components or modules. Clearly label the participants, messages, and the sequence of events.
        Database Diagrams: Draw ER Diagrams using mermaid.js in Markdown code blocks to illustrate the database schema, including tables, relationships, and keys. Clearly label entities, attributes, and primary/foreign keys.

        Please ensure that the entire output is structured as a Markdown file, ready for storage and later viewing."""

        final_prompt = f"{base_prompt}\n\n{context}"

        client = genai.Client(api_key=GEMINI_API_KEY)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=final_prompt,
        )
        with open("comprehensive_documentation.md", "w", encoding="utf-8") as f:
            f.write(response.text)
        return response.text
    
    except Exception as e:
        print(f"Error occurred: {e}")
        return {"status": "error", "message": str(e)}

@app.get("/")
def read_root():
    return {"message": "Hello World"}
        
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)