import os
import re
from google import genai

def get_existing_docs():
    try:
        with open("demo.md", "r", encoding="utf-8") as file:
            return file.read()
    except FileNotFoundError:
        print("No existing documentation found.")
        return ""

def get_existing_code():
    existing_code = ""
    file_extensions = [
        ".py", ".rb", ".js", ".mjs", ".cjs", ".php", ".pl", ".lua",
        ".sh", ".bat", ".ps1", ".c", ".h", ".cpp", ".cc", ".cxx", ".hpp",
        ".hh", ".hxx", ".java", ".cs", ".go", ".rs", ".swift", ".kt",
        ".html", ".htm", ".css", ".ts", ".tsx", ".ejs", ".pug", ".erb",
        ".r", ".R", ".m", ".mlx", ".sql", ".hs", ".lhs", ".scala", ".clj",
        ".ex", ".exs", ".erl", ".fs", ".vb", ".f", ".for", ".f90", ".asm",
        ".s", ".groovy"
    ]
    skip_files = {"app.py", ".gitignore"}
    for root, dirs, files in os.walk("."):
        dirs[:] = [d for d in dirs if d not in (".github", ".git", "venv", "node_modules")]
        for file in files:
            if file in skip_files:
                continue
            if file.endswith(tuple(file_extensions)):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        file_content = f.read()
                    existing_code += f"\n# File: {file_path}\n{file_content}\n"
                except Exception as e:
                    print(f"Could not read {file_path}: {e}")
    return existing_code

def chunk_text(text, chunk_size=5000):
    return [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]

def chunk_code(text, chunk_size=5000):
    raw_chunks = [chunk for chunk in re.split(r'(?=^# File:)', text, flags=re.MULTILINE) if chunk.strip()]
    final_chunks = []
    for chunk in raw_chunks:
        if len(chunk) <= chunk_size:
            final_chunks.append(chunk)
        else:
            for i in range(0, len(chunk), chunk_size):
                piece = chunk[i:i+chunk_size]
                if i != 0:
                    piece = "# File: (continued)\n" + piece
                final_chunks.append(piece)
    return final_chunks

def create_final_prompt(doc_chunks, code_chunks, base_prompt):
    prompt = base_prompt + "\n\n"
    max_len = max(len(doc_chunks), len(code_chunks))
    for i in range(max_len):
        doc_part = doc_chunks[i] if i < len(doc_chunks) else ""
        code_part = code_chunks[i] if i < len(code_chunks) else ""
        prompt += f"### Documentation (part {i+1}):\n{doc_part}\n\n"
        prompt += f"### Code (part {i+1}):\n{code_part}\n\n"
    return prompt

def generate_documentation(prompt):
    try:
        client = genai.Client(api_key="AIzaSyBVa5aFWnrXrKXREtn11bvsN0wQrMmUO-8")
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt
        )
        return response.text
    except Exception as e:
        print(f"Error generating documentation with Gemini: {e}")
        return ""

if __name__ == "__main__":
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

    existing_docs = get_existing_docs()
    existing_code = get_existing_code()

    doc_chunks = chunk_text(existing_docs)
    code_chunks = chunk_code(existing_code)

    final_prompt = create_final_prompt(doc_chunks, code_chunks, base_prompt)

    final_documentation = generate_documentation(final_prompt)

    with open("comprehensive_documentation.md", "w", encoding="utf-8") as f:
        f.write(final_documentation)

    print("Comprehensive documentation generated in comprehensive_documentation.md")
