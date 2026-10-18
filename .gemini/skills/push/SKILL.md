---
name: push
description: Automatically stages, commits all local changes, and pushes them to GitHub to trigger a live Vercel deployment.
---

# /push Workflow

When the user triggers `/push` or asks to push to live:

1. Check git status in `c:\Users\josep\OneDrive\Desktop\Retrocanopy\Website`.
2. Stage all changed and new files: `git add .`
3. Check if there are changes to commit.
4. If there are changes, commit with a descriptive message based on the recent changes made (or a message provided by the user).
5. Push to GitHub: `git push origin main`
6. Also update the desktop backup zip: `C:\Users\josep\OneDrive\Desktop\Retrocanopy_Website.zip`
7. Confirm to the user that the push succeeded and Vercel is deploying the updates automatically.
