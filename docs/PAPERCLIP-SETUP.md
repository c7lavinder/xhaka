# PAPERCLIP-SETUP.md
> Stable public access to Paperclip on the Mac mini.

---

## Overview

Paperclip runs locally at `http://127.0.0.1:3100` on the Mac mini. Two launchd services keep it alive across reboots:

| Service | Label | What it does |
|---------|-------|--------------|
| Paperclip | `ai.xhaka.paperclip` | Starts Paperclip via `npx paperclipai run` |
| Tunnel | `ai.xhaka.paperclip-tunnel` | Opens a Cloudflare tunnel to localhost:3100 |

---

## Current Tunnel Approach: Quick Tunnel (Temporary URL)

**Status: Ready to load — URL changes on each restart**

Cloudflared is installed but **not authenticated** to a Cloudflare account.
The current setup uses a Quick Tunnel (`*.trycloudflare.com`) which:
- ✅ Works immediately with no auth
- ✅ Auto-restarts via launchd if it dies
- ⚠️ URL changes every time the tunnel service restarts
- ⚠️ URL is NOT permanent

### Finding the current URL

After the tunnel starts, the URL is written to:
```
/Users/wholesaleai/.openclaw/workspace/data/paperclip-tunnel-url.txt
```

To read it:
```bash
cat ~/.openclaw/workspace/data/paperclip-tunnel-url.txt
```

Or check the tunnel log:
```bash
grep trycloudflare ~/.openclaw/workspace/logs/paperclip-tunnel.log | tail -5
```

---

## To Get a PERMANENT URL (Recommended)

Use a **Named Cloudflare Tunnel**. This gives you a fixed subdomain like `paperclip.xhaka.ai` that never changes.

### Step 1: Authenticate cloudflared (requires browser — do this manually)
```bash
cloudflared tunnel login
```
This opens a browser to authorize your Cloudflare account. After completing it, a `cert.pem` is saved to `~/.cloudflared/`.

### Step 2: Create the named tunnel
```bash
cloudflared tunnel create xhaka-paperclip
```
Note the tunnel ID from the output (a UUID like `abc12345-...`).

### Step 3: Route DNS (if you own xhaka.ai in Cloudflare)
```bash
cloudflared tunnel route dns xhaka-paperclip paperclip.xhaka.ai
```

### Step 4: Create tunnel config
Create `~/.cloudflared/config.yml`:
```yaml
tunnel: xhaka-paperclip
credentials-file: /Users/wholesaleai/.cloudflared/<TUNNEL-ID>.json
ingress:
  - hostname: paperclip.xhaka.ai
    service: http://localhost:3100
  - service: http_status:404
```

### Step 5: Update the tunnel launchd plist
Edit `/Users/wholesaleai/Library/LaunchAgents/ai.xhaka.paperclip-tunnel.plist` to use named tunnel instead of quick tunnel:

Replace the `ProgramArguments` array with:
```xml
<array>
  <string>/opt/homebrew/bin/cloudflared</string>
  <string>tunnel</string>
  <string>--config</string>
  <string>/Users/wholesaleai/.cloudflared/config.yml</string>
  <string>run</string>
  <string>xhaka-paperclip</string>
</array>
```

Then reload:
```bash
launchctl unload ~/Library/LaunchAgents/ai.xhaka.paperclip-tunnel.plist
launchctl load ~/Library/LaunchAgents/ai.xhaka.paperclip-tunnel.plist
```

---

## Alternative: Tailscale

Tailscale is NOT currently installed on this machine. If installed, you could use `tailscale serve` or `tailscale funnel` for a stable HTTPS URL without Cloudflare auth.

To install: https://tailscale.com/download/macos

---

## Managing Services

### Load both services (first time or after system reboot)
```bash
launchctl load ~/Library/LaunchAgents/ai.xhaka.paperclip.plist
launchctl load ~/Library/LaunchAgents/ai.xhaka.paperclip-tunnel.plist
```

### Unload (stop) services
```bash
launchctl unload ~/Library/LaunchAgents/ai.xhaka.paperclip.plist
launchctl unload ~/Library/LaunchAgents/ai.xhaka.paperclip-tunnel.plist
```

### Check if running
```bash
launchctl list | grep xhaka.paperclip
```

### Check logs
```bash
# Paperclip logs
tail -f ~/.openclaw/workspace/logs/paperclip.log

# Tunnel logs
tail -f ~/.openclaw/workspace/logs/paperclip-tunnel.log
```

---

## Manual Start (no launchd)

Start Paperclip:
```bash
cd ~ && npx paperclipai run
```

Start Quick Tunnel (separate terminal):
```bash
/opt/homebrew/bin/cloudflared tunnel --url http://localhost:3100
```

---

## Files Summary

| File | Purpose |
|------|---------|
| `~/Library/LaunchAgents/ai.xhaka.paperclip.plist` | Paperclip launchd service |
| `~/Library/LaunchAgents/ai.xhaka.paperclip-tunnel.plist` | Tunnel launchd service |
| `~/.openclaw/workspace/scripts/paperclip-tunnel.sh` | Tunnel start script (captures URL) |
| `~/.openclaw/workspace/data/paperclip-tunnel-url.txt` | Current tunnel URL (written at startup) |
| `~/.openclaw/workspace/logs/paperclip.log` | Paperclip stdout/stderr |
| `~/.openclaw/workspace/logs/paperclip-tunnel.log` | Tunnel stdout/stderr |

---

## ⚠️ Manual Steps Remaining

1. **Load the launchd services** (one-time, after verifying they look correct):
   ```bash
   launchctl load ~/Library/LaunchAgents/ai.xhaka.paperclip.plist
   launchctl load ~/Library/LaunchAgents/ai.xhaka.paperclip-tunnel.plist
   ```

2. **For a permanent URL** — run `cloudflared tunnel login` in a terminal on the Mac mini (needs browser), then follow the Named Tunnel steps above.

3. **Optional: Add `paperclip.xhaka.ai` to Paperclip's allowed hostnames** so it accepts requests from the tunnel domain:
   ```bash
   npx paperclipai allowed-hostname paperclip.xhaka.ai
   ```
   (Only needed for named tunnel with a custom domain.)
