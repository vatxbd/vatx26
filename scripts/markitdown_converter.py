#!/usr/bin/env python3
"""
Microsoft MarkItDown Document Converter & OCR Bridge for NBR Automation
Converts PDF, DOCX, XLSX, CSV, Images, and text documents into structured GitHub-Flavored Markdown.
"""

import sys
import os
import json
import base64
import tempfile
import traceback

def convert_document(input_path: str, filename: str = "", mime_type: str = ""):
    ext = os.path.splitext(filename or input_path)[1].lower()
    
    # 1. Try Microsoft MarkItDown package if installed
    try:
        from markitdown import MarkItDown
        md = MarkItDown()
        result = md.convert(input_path)
        markdown_text = (result.text_content or "").strip()
        is_empty_or_minimal = len(markdown_text) < 15
        return {
            "success": True,
            "markdown": markdown_text,
            "filename": filename or os.path.basename(input_path),
            "extension": ext,
            "char_count": len(markdown_text),
            "is_minimal": is_empty_or_minimal,
            "engine": "Microsoft MarkItDown Native"
        }
    except ImportError:
        pass
    except Exception as e:
        sys.stderr.write(f"MarkItDown native attempt error: {e}\n")

    # 2. Native format converters (CSV, TXT, MD, JSON)
    try:
        if ext in ['.txt', '.md', '.markdown']:
            with open(input_path, 'r', encoding='utf-8', errors='replace') as f:
                content = f.read().strip()
            return {
                "success": True,
                "markdown": content,
                "filename": filename or os.path.basename(input_path),
                "extension": ext,
                "char_count": len(content),
                "is_minimal": len(content) < 15,
                "engine": "Microsoft MarkItDown Text Bridge"
            }
        
        if ext == '.csv':
            import csv
            rows = []
            with open(input_path, 'r', encoding='utf-8', errors='replace') as f:
                reader = csv.reader(f)
                for r in reader:
                    rows.append(r)
            if rows:
                header = rows[0]
                md_table = "| " + " | ".join(header) + " |\n"
                md_table += "| " + " | ".join(["---"] * len(header)) + " |\n"
                for r in rows[1:]:
                    padded = r + [""] * (len(header) - len(r))
                    md_table += "| " + " | ".join(padded[:len(header)]) + " |\n"
                return {
                    "success": True,
                    "markdown": md_table,
                    "filename": filename or os.path.basename(input_path),
                    "extension": ext,
                    "char_count": len(md_table),
                    "is_minimal": False,
                    "engine": "Microsoft MarkItDown CSV Bridge"
                }

        if ext == '.json':
            with open(input_path, 'r', encoding='utf-8', errors='replace') as f:
                content = f.read().strip()
            return {
                "success": True,
                "markdown": f"```json\n{content}\n```",
                "filename": filename or os.path.basename(input_path),
                "extension": ext,
                "char_count": len(content),
                "is_minimal": len(content) < 15,
                "engine": "Microsoft MarkItDown JSON Bridge"
            }

        # For binary files (PDF, images, docx) when package is absent, return is_minimal=True so Vision OCR runs
        return {
            "success": True,
            "markdown": "",
            "filename": filename or os.path.basename(input_path),
            "extension": ext,
            "char_count": 0,
            "is_minimal": True,
            "engine": "Microsoft MarkItDown AI Vision Bridge Required"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc(),
            "filename": filename or os.path.basename(input_path)
        }

def main():
    if len(sys.argv) > 1 and sys.argv[1] != "--json":
        # Direct file path argument
        file_path = sys.argv[1]
        res = convert_document(file_path)
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return

    # Read JSON payload from stdin
    try:
        raw_input = sys.stdin.read()
        if not raw_input.strip():
            print(json.dumps({"success": False, "error": "Empty input"}))
            return
        
        payload = json.loads(raw_input)
        
        # Scenario 1: File path provided in JSON
        if "file_path" in payload and os.path.exists(payload["file_path"]):
            res = convert_document(payload["file_path"], payload.get("filename", ""), payload.get("mime_type", ""))
            print(json.dumps(res, ensure_ascii=False))
            return

        # Scenario 2: Base64 data provided
        if "base64" in payload:
            b64_data = payload["base64"]
            if "," in b64_data:
                b64_data = b64_data.split(",")[1]
            
            file_bytes = base64.b64decode(b64_data)
            ext = payload.get("extension", ".pdf")
            if not ext.startswith("."):
                ext = "." + ext

            with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp_file:
                tmp_file.write(file_bytes)
                tmp_path = tmp_file.name

            try:
                res = convert_document(tmp_path, payload.get("filename", f"document{ext}"), payload.get("mime_type", ""))
            finally:
                if os.path.exists(tmp_path):
                    try:
                        os.remove(tmp_path)
                    except:
                        pass
            
            print(json.dumps(res, ensure_ascii=False))
            return

        print(json.dumps({"success": False, "error": "No file_path or base64 provided"}))

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e), "traceback": traceback.format_exc()}))

if __name__ == "__main__":
    main()
