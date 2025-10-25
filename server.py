#!/usr/bin/env python3
import http.server
import socketserver
import os

# Set the port
PORT = 8000

# Set up the handler to serve files
Handler = http.server.SimpleHTTPRequestHandler

# For handling CORS
class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        return super().end_headers()

# Create the server
with socketserver.TCPServer(("", PORT), CORSHTTPRequestHandler) as httpd:
    print(f"Server started at http://localhost:{PORT}")
    print(f"Open this URL in your browser to test your audio player.")
    print("Press Ctrl+C to stop the server.")
    
    # Serve until interrupted
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.") 