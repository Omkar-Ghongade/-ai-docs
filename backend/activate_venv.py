import os
import subprocess
import sys

def activate_venv():
    venv_path = os.path.join(os.getcwd(), 'venv', 'Scripts', 'activate')
    if not os.path.exists(venv_path):
        print("Virtual environment not found! Make sure 'venv' exists in the current directory.")
        sys.exit(1)
    
    if sys.platform == "win32":
        subprocess.run(f'cmd.exe /K "{venv_path}"', shell=True)
    else:
        print("This script is designed for Windows. Use 'source venv/bin/activate' on Unix-like systems.")

if __name__ == "__main__":
    activate_venv()
