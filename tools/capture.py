#!/usr/bin/env python3
"""
Tiny capture server.

macOS ships no SVG rasteriser (sips can't read SVG, and there's no
ImageMagick/rsvg here), but Chrome renders SVG perfectly. This serves
the project directory AND accepts a POST of a canvas blob, so the
browser can do the rasterising and hand the bytes back to disk.

    python3 tools/capture.py 8788
    -> GET  any project file
    -> POST /save?name=foo.jpg   with the raw image bytes as the body
"""
import os, sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "build", "tmp")


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def do_POST(self):
        u = urlparse(self.path)
        if u.path != "/save":
            self.send_error(404)
            return
        name = (parse_qs(u.query).get("name") or ["capture.bin"])[0]
        name = os.path.basename(name)          # no path traversal
        n = int(self.headers.get("Content-Length", 0))
        data = self.rfile.read(n)
        os.makedirs(OUT, exist_ok=True)
        path = os.path.join(OUT, name)
        with open(path, "wb") as f:
            f.write(data)
        print(f"  saved {name}  {len(data)/1024:.0f} KB", flush=True)
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(b"ok")

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()

    def log_message(self, *a):
        pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8788
    print(f"capture server on http://localhost:{port}  (root: {ROOT})", flush=True)
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
