from youtube_transcript_api import YouTubeTranscriptApi
from http.server import BaseHTTPRequestHandler
import json
import urllib.parse

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        query = urllib.parse.urlparse(self.path).query
        params = urllib.parse.parse_qs(query)
        video_id = params.get("video_id", [None])[0]

        if not video_id:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b'Missing video_id')
            return

        try:
            transcript = YouTubeTranscriptApi.get_transcript(video_id)
            text = "\n".join([item["text"] for item in transcript])

            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()

            self.wfile.write(json.dumps({"text": text}).encode())

        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode())
