# Deployment & cross-device setup

You're hosting `app.html` as a static page and syncing your data via a **GitHub Gist**. Both are free-forever. Together they let you open the tool from any browser on any device with consistent data.

---

## Part 1 — Host `app.html` somewhere free-forever

### Option A — GitHub Pages (recommended)

This is the simplest path since you already have a GitHub account (for the Gist sync). Free for public repos. No bandwidth ceiling you'll ever hit for personal use.

1. **Create a public GitHub repo.** Go to [github.com/new](https://github.com/new). Name it something like `phone-screen-tool`. Set visibility to **Public**. Don't initialize with a README — keep it empty. Click *Create repository*.

2. **Push `app.html` to the repo.** Easiest path is via the web UI:
   - On the empty repo page, click *uploading an existing file*.
   - Drag `app.html` from this project folder onto the upload area.
   - Click *Commit changes*.

3. **Enable Pages.** In the repo, go to *Settings* (top tabs) → *Pages* (left sidebar). Under *Build and deployment*, set:
   - **Source**: Deploy from a branch
   - **Branch**: `main` (or `master`) and `/ (root)`
   - Click *Save*

4. **Wait ~30 seconds**, then refresh the Pages page. You'll see *Your site is live at* `https://YOUR_USERNAME.github.io/phone-screen-tool/app.html`.

5. **Bookmark that URL** on your phone and laptop. Open it anywhere.

**To update `app.html` later:**
- Web UI: open the file in the repo, click the pencil icon, paste new content, commit.
- Command line: clone the repo, replace the file, `git add app.html && git commit -m 'update' && git push`.

GitHub deploys the change in ~30 seconds.

> **No secrets in this file.** Your API key, GitHub token, and Gist ID are stored in each device's localStorage — they never appear in the HTML. So a public repo is fine. Anyone who finds the URL sees an empty app shell and would have to set up their own keys to use it.

### Option B — Cloudflare Pages (truly unlimited bandwidth)

If you ever worry about running into limits — Cloudflare Pages is the most generous free tier. Unlimited bandwidth, unlimited requests. The downside: one new account to set up.

1. Push `app.html` to a GitHub repo (same as steps 1-2 above).
2. Sign up at [pages.cloudflare.com](https://pages.cloudflare.com/) (free).
3. *Create a project* → *Connect to Git* → authorize Cloudflare to your GitHub.
4. Pick your repo, framework preset: *None*, build command: blank, output dir: `/`. Click *Save and Deploy*.
5. You get a URL like `https://phone-screen-tool.pages.dev/app.html`.

Every push to GitHub auto-deploys in ~10 seconds.

### Option C — Surge.sh (zero-account, one command)

For when you just want it deployed without any web UI.

```bash
npm install -g surge
cd "/Users/ivyjby/Documents/Claude/Projects/Phone Screen Conversion Rate (ATS)/"
surge
```

It'll prompt for an email/password (creates an account silently on first run), then asks which folder to upload and what subdomain. Pick `phone-screen-tool.surge.sh` or whatever. Done.

To update later: re-run `surge` in the same folder. It'll deploy over the same URL.

### What doesn't work (and why)

- **Google Drive, iCloud Drive, Dropbox** — all removed HTML-as-website hosting years ago (2016 for Drive). They can sync files but won't serve them to a browser as a webpage.
- **Vercel** — free Hobby tier TOS says "non-commercial use only". Probably fine for a personal tool but technically gray.
- **Render free / Netlify free / Firebase Hosting free** — all have bandwidth caps (10-100 GB/month) that pause the site when hit, which is what just happened to you.

---

## Part 2 — Set up GitHub Gist sync (data layer)

This is unchanged regardless of where you host. Your jobs / batches / criteria / resumes auto-sync to a private gist about 3 seconds after every change.

### One-time setup (primary device)

1. Create a GitHub personal access token at [github.com/settings/tokens](https://github.com/settings/tokens?type=beta):
   - Recommended: **fine-grained token** with name `phone-screen-tool-sync`, expiration 90 days+
   - **Account permissions** → **Gists**: Read and write
   - Or classic token with `gist` scope only
   - Copy the `github_pat_...` value
2. Open the tool (your new URL from Part 1)
3. Settings → **Cross-device sync** → paste the token
4. Click *Create gist* — gives you a gist ID and starts auto-syncing

### On each additional device

1. Open the tool (same URL)
2. Settings → Cross-device sync → paste **same token** + **same gist ID**
3. Click *Pull now* — replaces local data with cloud data, page reloads

After this, changes on any device push to gist within ~3 seconds. When you open another device, it auto-pulls if the gist is newer.

---

## Migrating off Netlify

Your existing data is fine — it's in localStorage on each device + (if configured) on your GitHub Gist. The only thing tied to Netlify was the URL. Once you set up a new host:

1. Make sure your Gist sync is configured and last-synced timestamp is recent (Settings → Cross-device sync should say "Sync configured").
2. Open the new URL on each device.
3. Settings → Cross-device sync → paste your existing token + gist ID → *Pull now*.
4. You're back to where you were before Netlify paused.

You can delete the Netlify project once you've verified the new URL works on all your devices.

---

## Troubleshooting

**"GitHub Pages is taking forever"** — first build can take ~5 minutes. Subsequent updates are ~30 seconds. Check repo → Settings → Pages for build status.

**"Sync stopped working"** — check the gist token didn't expire. Generate a new one with the same scope and paste it into Settings.

**"Site shows raw markdown / 404"** — make sure your repo has `app.html` at the root (not inside a subfolder) and Pages is set to branch root.

**"I want a custom domain"** — GitHub Pages supports custom domains for free. In repo Settings → Pages → Custom domain → enter your domain, then configure DNS at your registrar. Free.
