#!/usr/bin/env python3
"""
Simple HTTP server to handle form submissions and save to CSV.
Uses only Python standard library. No frameworks required.

Usage:
    python server.py

Then open http://localhost:8000 in your browser.
Other devices on the network can access via http://<your-ip>:8000
"""

import os
import csv
import json
import socket
from datetime import datetime
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import parse_qs
import threading

# Configuration
PORT = 8000
CSV_FILE = 'data.csv'
CSV_HEADERS = ['Name', 'Email', 'Date', 'Time']

# Lock for thread-safe CSV writes
csv_lock = threading.Lock()


def get_local_ip():
    """Get the local IP address for network access."""
    try:
        # Connect to an external address to determine local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return '127.0.0.1'


def ensure_csv_exists():
    """Create CSV file with headers if it doesn't exist."""
    if not os.path.exists(CSV_FILE):
        with open(CSV_FILE, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(CSV_HEADERS)
        print(f"Created {CSV_FILE} with headers: {CSV_HEADERS}")


def append_to_csv(name, email):
    """
    Append a submission to the CSV file.
    Uses a lock to ensure thread-safe writes.
    """
    now = datetime.now()
    date_str = now.strftime('%Y-%m-%d')
    time_str = now.strftime('%H:%M:%S')
    
    # Thread-safe write
    with csv_lock:
        with open(CSV_FILE, 'a', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow([name, email, date_str, time_str])
    
    print(f"Saved: {name}, {email}")


class FormHandler(SimpleHTTPRequestHandler):
    """
    Custom request handler that:
    - Serves static files (HTML, CSS, JS, images)
    - Handles POST requests to /submit for form data
    """
    
    def do_POST(self):
        """Handle POST requests for form submission."""
        if self.path == '/submit':
            # Get content length to read the body
            content_length = int(self.headers.get('Content-Length', 0))
            
            # Read and parse the POST data
            post_data = self.rfile.read(content_length).decode('utf-8')
            
            try:
                # Parse JSON data from the form
                data = json.loads(post_data)
                name = data.get('name', '').strip()
                email = data.get('email', '').strip()
                
                # Validate required fields
                if not name or not email:
                    self.send_error_response(400, 'Name and email are required')
                    return
                
                # Save to CSV
                append_to_csv(name, email)
                
                # Send success response
                self.send_json_response(200, {
                    'success': True,
                    'message': 'Submission saved successfully'
                })
                
            except json.JSONDecodeError:
                self.send_error_response(400, 'Invalid JSON data')
            except Exception as e:
                self.send_error_response(500, f'Server error: {str(e)}')
        else:
            # Unknown POST endpoint
            self.send_error_response(404, 'Endpoint not found')
    
    def send_json_response(self, code, data):
        """Send a JSON response with the given status code."""
        response = json.dumps(data).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', len(response))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(response)
    
    def send_error_response(self, code, message):
        """Send a JSON error response."""
        self.send_json_response(code, {
            'success': False,
            'message': message
        })
    
    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def log_message(self, format, *args):
        """Custom log format."""
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {args[0]}")


def main():
    """Start the HTTP server."""
    # Ensure CSV file exists with headers
    ensure_csv_exists()
    
    # Get local IP for network access info
    local_ip = get_local_ip()
    
    # Create and start the server (bind to all interfaces for network access)
    server = HTTPServer(('0.0.0.0', PORT), FormHandler)
    
    print("=" * 50)
    print("WATSS Form Server")
    print("=" * 50)
    print(f"Local access:   http://localhost:{PORT}")
    print(f"Network access: http://{local_ip}:{PORT}")
    print(f"CSV file:       {os.path.abspath(CSV_FILE)}")
    print("=" * 50)
    print("Press Ctrl+C to stop the server")
    print()
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
        server.shutdown()


if __name__ == '__main__':
    main()


