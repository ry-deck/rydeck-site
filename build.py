from pathlib import Path
import json
import re

PROJECT_DIR = Path("projects")
OUTPUT = Path("projects.js")
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}

def project_name_from_file(path):
    match = re.match(r"^(.*?)\s+\d+\.[^.]+$", path.name, re.IGNORECASE)
    return match.group(1) if match else path.stem

def image_number(path):
    match = re.search(r"\s+(\d+)\.[^.]+$", path.name)
    return int(match.group(1)) if match else 0

projects = {}

for path in PROJECT_DIR.iterdir():
    if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS:
        name = project_name_from_file(path)
        projects.setdefault(name, []).append(path)

output = []

for name in sorted(projects, key=str.lower):
    images = sorted(projects[name], key=image_number)

    is_exhibition = name.startswith("EX_")

    display_name = name[3:] if is_exhibition else name

    text_path = PROJECT_DIR / f"{name}.txt"
    text = text_path.read_text(encoding="utf-8") if text_path.exists() else ""

    thumbnail = next(
        (p for p in images if image_number(p) == 0),
        images[0]
    )

    gallery_images = [
        p for p in images
        if image_number(p) != 0
    ]

    if not gallery_images:
        gallery_images = [thumbnail]

    output.append({
        "name": display_name,
        "image": str(thumbnail).replace("\\", "/"),
        "images": [
            str(p).replace("\\", "/")
            for p in gallery_images
        ],
        "text": text,
        "exhibition": is_exhibition
    })

content = """/*
  GENERATED FILE — do not edit by hand.
  Run: python build.py
*/

const PROJECTS = %s;
""" % json.dumps(output, indent=2, ensure_ascii=False)

OUTPUT.write_text(content, encoding="utf-8")

print(f"Built {len(output)} projects.")