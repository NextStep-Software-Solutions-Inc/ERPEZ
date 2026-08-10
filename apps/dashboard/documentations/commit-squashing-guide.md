# Commit Squashing Guide for PR #174

## Issue
13 duplicate commits with message "Potential fix for pull request finding" need to be squashed into a single clean commit before merging.

**Commits to squash** (oldest to newest):
- 79e0d115 to fafcc6ba (13 commits total)

## ✅ Recommended Approach: Using VS Code + Git UI

### Step 1: Start the Interactive Rebase
```bash
git rebase -i dfc79a8f
```
This opens your editor with all commits from dfc79a8f to HEAD.

### Step 2: Edit the Rebase TODO List
In the editor, you'll see commits listed. Modify as follows:

**BEFORE:**
```
pick 5926d3a6 fix: Update navigation paths in APRDetailsPage to remove trailing slashes
pick fafcc6ba Potential fix for pull request finding
pick 58da65ac Potential fix for pull request finding
pick d7e2eeba Potential fix for pull request finding
pick 2cee5c84 Potential fix for pull request finding
pick da5007bb Potential fix for pull request finding
pick 6e947950 Potential fix for pull request finding
pick 53fad894 Potential fix for pull request finding
pick c83c4b7b Potential fix for pull request finding
pick 50f4f2bd Potential fix for pull request finding
pick 1556c771 Potential fix for pull request finding
pick 0d0b8ba5 Potential fix for pull request finding
pick 79e0d115 Potential fix for pull request finding
pick 272beaa5 Merge branch 'dashboard/v2/feature/procurement/agency-procurement-request'
pick d4d01563 feat: Enhance APP and APR integration...
pick 12dbe7fe feat: Update mock data...
pick 8b3658d1 Merge branch 'dev'...
pick 58baffe7 feat: Enhance APR creation...
pick ab4d9cef feat: Improve APP and Admin APR...
```

**AFTER:**
```
pick 5926d3a6 fix: Update navigation paths in APRDetailsPage to remove trailing slashes
pick fafcc6ba Potential fix for pull request finding
squash 58da65ac Potential fix for pull request finding
squash d7e2eeba Potential fix for pull request finding
squash 2cee5c84 Potential fix for pull request finding
squash da5007bb Potential fix for pull request finding
squash 6e947950 Potential fix for pull request finding
squash 53fad894 Potential fix for pull request finding
squash c83c4b7b Potential fix for pull request finding
squash 50f4f2bd Potential fix for pull request finding
squash 1556c771 Potential fix for pull request finding
squash 0d0b8ba5 Potential fix for pull request finding
squash 79e0d115 Potential fix for pull request finding
pick 272beaa5 Merge branch 'dashboard/v2/feature/procurement/agency-procurement-request'
pick d4d01563 feat: Enhance APP and APR integration...
pick 12dbe7fe feat: Update mock data...
pick 8b3658d1 Merge branch 'dev'...
pick 58baffe7 feat: Enhance APR creation...
pick ab4d9cef feat: Improve APP and Admin APR...
```

**Key Change**: Replace `pick` with `squash` for the 12 duplicate commits after the first one.

### Step 3: Save and Close the Editor
- VS Code: Press Ctrl+S, then close the editor tab
- Vim: Type `:wq` and press Enter
- Nano: Press Ctrl+O, Enter, Ctrl+X

### Step 4: Edit Commit Message (if prompted)
Git will show you the combined commit message. Edit to keep only the first commit's message or create a meaningful message summarizing all 13 commits.

Example:
```
fix: Consolidate pull request finding fixes

This squashes 13 commits that were used during development to resolve
pull request issues. All changes have been validated and tested.
```

### Step 5: Complete the Rebase
If everything looks good, git will automatically complete. If there are conflicts:
- Resolve conflicts in the affected files
- Run `git add .`
- Run `git rebase --continue`

## ✅ Alternative: Force-Push with Clear History

If you need a cleaner approach:

```bash
# Backup current branch (just in case)
git branch backup-before-squash

# Reset to before all 13 commits
git reset --soft fafcc6ba

# Unstage everything
git reset HEAD

# See what changed
git diff --cached

# Create a single clean commit
git commit -m "feat: Enhance PSDBM and APR integration with mock data and utilities

- Implement PSDBM catalog system (categories, depots, items) with mock data
- Add request handlers and React Query hooks for PSDBM data fetching
- Enhance APR with APP selection, consolidation, and validation
- Add comprehensive APR/APP integration utilities and components
- Implement budget ceiling validation and APR reconciliation logic
- Add mock data for draft APR generation and approved APPs
- Create new dialogs: SelectAPPDialog, improved item selection
- Add validation hooks for APR submission and budget alignment
- Update documentation with APR/APP integration patterns"

# Push with force (⚠️ only if you own the PR)
git push origin dashboard/v2/feature/procurement/agency-procurement-request --force-with-lease
```

## ⚠️ Important Notes

1. **Before squashing**: Make sure you have a backup: `git branch backup-before-squash`
2. **Force push carefully**: Only use `--force-with-lease` (safer than `--force`)
3. **Coordinate with team**: If others are working on this branch, coordinate first
4. **PR impact**: GitHub will update the PR automatically after the force push

## Troubleshooting

### "Rebase conflict" error
```bash
# View conflicts
git status

# Resolve in editor, then:
git add .
git rebase --continue
```

### "Need to abort"
```bash
git rebase --abort
```

### "Pushed before squashing, need to clean up"
```bash
# Contact team lead to unprotect the branch, then:
git push origin dashboard/v2/feature/procurement/agency-procurement-request --force-with-lease
```

## References
- Git docs: https://git-scm.com/docs/git-rebase
- Interactive rebase: https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History
