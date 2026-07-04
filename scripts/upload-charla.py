#!/usr/bin/env python3
"""
Upload charla-jailbreak.html to VPS, preserving the current PIN hash from Caddy.
Prevents accidentally overwriting the PIN hash when pushing HTML changes.
"""
import subprocess, sys, re, os

PATH = os.path.expanduser('~/repos/jail/docs/charla-jailbreak.html')
SSH = ['ssh', '-i', os.path.expanduser('~/.ssh/id_rsa_hostinger'), 'root@2.24.69.47']
SCP = ['scp', '-i', os.path.expanduser('~/.ssh/id_rsa_hostinger')]

# 1. Get current hash from VPS Caddy
r = subprocess.run(SSH + ["grep -oP 'X-Demo-Token} == \"\\K[a-f0-9]+' /etc/caddy/Caddyfile | head -1"],
    capture_output=True, text=True, timeout=15)
current_hash = r.stdout.strip()
if not re.match(r'^[a-f0-9]+$', current_hash):
    print("ERROR: no valid hash from Caddy:", repr(current_hash))
    sys.exit(1)
print(f"Current hash on VPS: {current_hash}")

# 2. Read local HTML and check its hash
with open(PATH, 'r') as f:
    html = f.read()
m = re.search(r"(?:const|let)\s+EXPECTED_HASH='([a-f0-9]+)'", html)
local_hash = m.group(1) if m else None
print(f"Local HTML hash: {local_hash}")

# 3. If different, patch local HTML in-memory before upload (don't save to disk)
if local_hash and local_hash != current_hash:
    html = html.replace(
        f"EXPECTED_HASH='{local_hash}'",
        f"EXPECTED_HASH='{current_hash}'"
    )
    print(f"Patched hash: {local_hash} -> {current_hash}")

# 4. Write to temp, upload, cleanup
tmp = '/tmp/charla-upload.html'
with open(tmp, 'w') as f:
    f.write(html)

r = subprocess.run(SCP + [tmp, 'root@2.24.69.47:/var/www/charla/index.html'],
    capture_output=True, text=True, timeout=60)
if r.returncode == 0:
    print("Upload: OK")
else:
    print("Upload FAILED:", r.stderr)
    sys.exit(1)

os.remove(tmp)
