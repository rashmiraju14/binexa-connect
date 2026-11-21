"""Key-protected local translator gateway for temporary Vercel preview testing."""
import hmac
import logging
from pathlib import Path

import requests
from flask import Flask, jsonify, request
from waitress import serve

logging.disable(logging.INFO)
key = Path('/tmp/binexa-translation-preview.key').read_text().strip()
if len(key) < 32:
    raise RuntimeError('A private preview key is required')
app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 80000

@app.get('/health')
def health():
    return jsonify(status='preview-gateway')

@app.post('/translate')
def translate():
    body = request.get_json(silent=True)
    if not isinstance(body, dict) or not isinstance(body.get('api_key'), str) or not hmac.compare_digest(body['api_key'], key):
        return jsonify(error='Unauthorized'), 401
    payload = {name: body[name] for name in ['q', 'source', 'target', 'format'] if name in body}
    try:
        response = requests.post('http://127.0.0.1:5100/translate', json=payload, timeout=55)
        return jsonify(response.json()), response.status_code, {'Cache-Control': 'private, no-store'}
    except (requests.RequestException, ValueError):
        return jsonify(error='Translator unavailable'), 502

if __name__ == '__main__':
    serve(app, host='127.0.0.1', port=5101, threads=4)
