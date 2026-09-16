"""Development QA only; generated HTML does not require this server."""
import argparse
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

parser = argparse.ArgumentParser()
parser.add_argument('--port', type=int, default=4173)
parser.add_argument('--host', default='0.0.0.0')
args, _ = parser.parse_known_args()
ThreadingHTTPServer((args.host, args.port), partial(SimpleHTTPRequestHandler, directory='dist')).serve_forever()
