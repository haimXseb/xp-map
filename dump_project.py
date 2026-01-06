import os

# הגדרות: איזה סיומות לקחת ואיזה תיקיות לסנן
ALLOWED_EXTENSIONS = {'.ts', '.html', '.css', '.json', '.md'}
IGNORE_DIRS = {'node_modules', 'dist', '.git', '.idea', '.vscode', '__pycache__', 'legacy old'}
IGNORE_FILES = {'package-lock.json', 'dump_project.py', 'FULL_CODEBASE.txt'}

def is_text_file(filename):
    return any(filename.endswith(ext) for ext in ALLOWED_EXTENSIONS)

def generate_dump():
    output_filename = "DASHBOARD_FULL_CODEBASE.txt"
    
    with open(output_filename, 'w', encoding='utf-8') as outfile:
        # כותרת ראשית ל-AI
        outfile.write(f"# FULL PROJECT DUMP\n")
        outfile.write(f"# This file contains the entire codebase structure and content.\n")
        outfile.write(f"# Treat each section below as a separate file path.\n\n")

        # ריצה על כל התיקיות
        for root, dirs, files in os.walk("."):
            # סינון תיקיות אסורות
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            
            for file in files:
                if file in IGNORE_FILES:
                    continue
                
                if is_text_file(file):
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path, ".")
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8') as infile:
                            content = infile.read()
                            
                            # פורמט מובנה עבור NotebookLM
                            outfile.write("=" * 50 + "\n")
                            outfile.write(f"FILE_PATH: {relative_path}\n")
                            outfile.write("=" * 50 + "\n")
                            outfile.write(content + "\n\n")
                            print(f"Processed: {relative_path}")
                    except Exception as e:
                        print(f"Skipped {relative_path}: {e}")

    print(f"\n✅ Success! All files merged into: {output_filename}")

if __name__ == "__main__":
    generate_dump()
