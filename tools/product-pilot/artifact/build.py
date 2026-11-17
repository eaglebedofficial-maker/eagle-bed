"""Build the Product Pilot artifact (single HTML) and the extension zip."""
import base64, io, os, zipfile
ROOT = os.path.dirname(os.path.abspath(__file__))
EXT = os.path.join(ROOT, "..", "extension")
DIST = os.path.join(ROOT, "..", "dist")
os.makedirs(DIST, exist_ok=True)
buf = io.BytesIO()
with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
    for base, _, files in os.walk(EXT):
        for f in sorted(files):
            full = os.path.join(base, f)
            z.write(full, os.path.join("product-pilot-extension", os.path.relpath(full, EXT)))
zbytes = buf.getvalue()
open(os.path.join(DIST, "product-pilot-extension-v2.zip"), "wb").write(zbytes)
shell = open(os.path.join(ROOT, "src", "shell.html"), encoding="utf-8").read()
engine = open(os.path.join(EXT, "engine.js"), encoding="utf-8").read()
app = open(os.path.join(ROOT, "src", "app.js"), encoding="utf-8").read()
html = (shell + "\n<script>\n" + engine.replace("</script", "<\\/script") + "\n</script>\n<script>window.PP_EXT_ZIP=\""
        + base64.b64encode(zbytes).decode() + "\";</script>\n<script>\n" + app.replace("</script", "<\\/script") + "\n</script>\n")
out = os.path.join(ROOT, "product-pilot.html")
open(out, "w", encoding="utf-8").write(html)
print("zip", len(zbytes), "html", len(html))
