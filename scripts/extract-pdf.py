"""Render every PDF page to WebP (2 sizes) for the portfolio.
Usage: python3 scripts/extract-pdf.py "INVENT BRANDING.pdf" invent
Needs poppler (pdftoppm) and Pillow.
"""
import subprocess, sys, tempfile, glob, os
from PIL import Image

pdf = sys.argv[1] if len(sys.argv) > 1 else "INVENT BRANDING.pdf"
prefix = sys.argv[2] if len(sys.argv) > 2 else "invent"
out = os.path.join("public", "work")
os.makedirs(out, exist_ok=True)
with tempfile.TemporaryDirectory() as tmp:
    subprocess.run(["pdftoppm", "-png", "-scale-to-x", "2560", "-scale-to-y", "-1", pdf, os.path.join(tmp, "p")], check=True)
    for f in sorted(glob.glob(os.path.join(tmp, "p-*.png"))):
        n = int(f.rsplit("-", 1)[1].split(".")[0])
        im = Image.open(f).convert("RGB")
        for w, q, suf in ((2560, 82, "lg"), (1280, 80, "md"), (640, 72, "sm")):
            r = im if im.width == w else im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
            r.save(os.path.join(out, f"{prefix}-{n:02d}-{suf}.webp"), "WEBP", quality=q, method=6)
        print("page", n)
