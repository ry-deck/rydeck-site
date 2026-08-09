from pathlib import Path
import json
import re

PROJECT_DIR = Path("projects")
OUTPUT = Path("projects.js")

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


def project_name_from_file(path):
    """
    Examples:
        Mudlark 0.jpg -> Mudlark
        Mudlark 2.jpg -> Mudlark
        Mudlark 3.youtube.txt -> Mudlark
    """

    match = re.match(
        r"^(.*?)\s+\d+(?:\.youtube)?\.[^.]+$",
        path.name,
        re.IGNORECASE
    )

    return match.group(1) if match else path.stem


def media_number(path):
    """
    Extracts the slide number.

    Mudlark 3.jpg -> 3
    Mudlark 3.youtube.txt -> 3
    """

    match = re.search(
        r"\s+(\d+)(?:\.youtube)?\.[^.]+$",
        path.name,
        re.IGNORECASE
    )

    return int(match.group(1)) if match else 0


def youtube_embed_url(url):
    """
    Converts normal YouTube links into embed links.

    Supports:
        https://www.youtube.com/watch?v=ABC123
        https://youtu.be/ABC123
        https://www.youtube.com/embed/ABC123
    """

    url = url.strip()

    if "youtube.com/embed/" in url:
        return url

    match = re.search(r"youtube\.com/watch\?v=([^&\s]+)", url)

    if match:
        return f"https://www.youtube.com/embed/{match.group(1)}"

    match = re.search(r"youtu\.be/([^?\s]+)", url)

    if match:
        return f"https://www.youtube.com/embed/{match.group(1)}"

    return url


projects = {}

for path in PROJECT_DIR.iterdir():
    if not path.is_file():
        continue

    filename = path.name.lower()

    # Normal project images
    if path.suffix.lower() in IMAGE_EXTENSIONS:
        name = project_name_from_file(path)

        projects.setdefault(name, []).append({
            "type": "image",
            "number": media_number(path),
            "path": path
        })

    # YouTube gallery slides
    elif filename.endswith(".youtube.txt"):
        name = project_name_from_file(path)

        url = path.read_text(
            encoding="utf-8"
        ).strip()

        projects.setdefault(name, []).append({
            "type": "youtube",
            "number": media_number(path),
            "url": youtube_embed_url(url)
        })


output = []

for name in sorted(projects, key=str.lower):

    media = sorted(
        projects[name],
        key=lambda item: item["number"]
    )

    is_exhibition = name.startswith("EX_")

    display_name = (
        name[3:]
        if is_exhibition
        else name
    )

    # Project description still uses:
    # Mudlark.txt
    # EX_Mudlark.txt
    text_path = PROJECT_DIR / f"{name}.txt"

    text = (
        text_path.read_text(encoding="utf-8")
        if text_path.exists()
        else ""
    )

    # ---------------------------------------------------
    # HOMEPAGE THUMBNAIL
    # ---------------------------------------------------

    # Use image 0 as homepage thumbnail.
    thumbnail_item = next(
        (
            item
            for item in media
            if item["type"] == "image"
            and item["number"] == 0
        ),
        None
    )

    # Fallback to first image if there is no 0.jpg.
    if thumbnail_item is None:
        thumbnail_item = next(
            (
                item
                for item in media
                if item["type"] == "image"
            ),
            None
        )

    # Skip projects that have no images at all.
    if thumbnail_item is None:
        continue

    thumbnail_path = str(
        thumbnail_item["path"]
    ).replace("\\", "/")

    # ---------------------------------------------------
    # GALLERY
    # ---------------------------------------------------

    gallery = []

    for item in media:

        # Image 0 is homepage-only.
        if (
            item["type"] == "image"
            and item["number"] == 0
        ):
            continue

        if item["type"] == "image":
            gallery.append({
                "type": "image",
                "url": str(
                    item["path"]
                ).replace("\\", "/")
            })

        elif item["type"] == "youtube":
            gallery.append({
                "type": "youtube",
                "url": item["url"]
            })

    # Fallback if project only contains image 0.
    if not gallery:
        gallery.append({
            "type": "image",
            "url": thumbnail_path
        })

    output.append({
        "name": display_name,
        "image": thumbnail_path,
        "images": gallery,
        "text": text,
        "exhibition": is_exhibition
    })


content = """/*
  GENERATED FILE — do not edit by hand.
  Run: python build.py
*/

const PROJECTS = %s;
""" % json.dumps(
    output,
    indent=2,
    ensure_ascii=False
)

OUTPUT.write_text(
    content,
    encoding="utf-8"
)

print(f"Built {len(output)} projects.")