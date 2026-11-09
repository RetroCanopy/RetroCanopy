import os
import sys
import urllib.parse
import winsound
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

WEB_DIR = r"C:\Users\josep\OneDrive\Desktop\Retrocanopy\Website"
os.chdir(WEB_DIR)

AUDIO_MAP = {
    "intro": os.path.join(WEB_DIR, "assets", "intro_theme.wav"),
    "syn": os.path.join(WEB_DIR, "assets", "syn_journey.wav"),
    "boom": os.path.join(WEB_DIR, "assets", "cup_boom.wav"),
    "tick": os.path.join(WEB_DIR, "assets", "type_tick.wav"),
}

class RetroAudioHTTPHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/audio":
            qs = urllib.parse.parse_qs(parsed.query)
            cmd = (qs.get("cmd", [""])[0] or "").strip().lower()
            try:
                if cmd in ("stop", "stop_syn"):
                    winsound.PlaySound(None, winsound.SND_PURGE)
                elif cmd in AUDIO_MAP and os.path.exists(AUDIO_MAP[cmd]):
                    winsound.PlaySound(AUDIO_MAP[cmd], winsound.SND_FILENAME | winsound.SND_ASYNC)
            except Exception:
                pass
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(b'{"ok":true}')
            return
        return super().do_GET()

if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8095
    srv = ThreadingHTTPServer(("0.0.0.0", port), RetroAudioHTTPHandler)
    print(f"Retrocanopy HTTP + Native Audio Server listening on http://localhost:{port}")
    srv.serve_forever()
