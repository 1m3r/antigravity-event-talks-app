import http.server
import socketserver
import urllib.request
import ssl

PORT = 5000

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/notes':
            url = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"
            try:
                # Bypass SSL verification if needed
                ctx = ssl.create_default_context()
                ctx.check_hostname = False
                ctx.verify_mode = ssl.CERT_NONE
                
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, context=ctx) as response:
                    xml_data = response.read()
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/xml; charset=utf-8')
                self.end_headers()
                self.wfile.write(xml_data)
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'text/plain; charset=utf-8')
                self.end_headers()
                self.wfile.write(str(e).encode('utf-8'))
        else:
            # Map '/' to our index.html
            if self.path == '/':
                self.path = '/templates/index.html'
            return super().do_GET()

if __name__ == '__main__':
    with socketserver.TCPServer(("", PORT), ProxyHandler) as httpd:
        print(f"Server running at http://localhost:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")
