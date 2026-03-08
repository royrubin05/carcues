---
description: Push CarCues to GitHub repository
---

# Push to GitHub

Push the CarCues project to the GitHub repository at https://github.com/royrubin05/carcues.git

## Steps

// turbo-all

1. Make sure you are in the project directory:
```bash
cd /Users/jonathanrubin/Desktop/CarCues
```

2. Check if git is initialized, if not initialize it:
```bash
git init
```

3. Configure git user for this repo:
```bash
git config user.email "roy.rubin@gmail.com"
git config user.name "Roy Rubin"
```

4. Ensure .gitignore exists and excludes sensitive files:
```bash
cat .gitignore
```
Make sure `.env` is in `.gitignore` (API keys should never be committed).

5. Set the remote origin (skip if already set):
```bash
git remote add origin https://github.com/royrubin05/carcues.git 2>/dev/null || git remote set-url origin https://github.com/royrubin05/carcues.git
```

6. Stage all files:
```bash
git add -A
```

7. Commit with a descriptive message:
```bash
git commit -m "description of changes"
```

8. Push to GitHub:
```bash
git push -u origin main
```

If the branch is `master` instead of `main`, use:
```bash
git push -u origin master
```

## Notes
- Never commit `.env` files (contains API keys)
- Always check `git status` before pushing if unsure
