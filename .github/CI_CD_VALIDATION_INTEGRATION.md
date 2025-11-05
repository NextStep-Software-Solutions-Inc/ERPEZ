# CI/CD Validation Check Integration

## Overview

The validation coverage check is now integrated into the CI/CD pipeline. All commits and pull requests will be automatically checked for FluentValidation coverage before deployment.

## What Happens in CI/CD

### Test Job (Runs First)

```yaml
test:
  name: Run Tests and Validation Checks
  runs-on: ubuntu-latest
  
  steps:
    1. Checkout code
    2. Setup .NET 9.0
    3. Restore dependencies
    4. Build solution (Release)
    5. Check Validation Coverage ⚠️ (FAILS IF MISSING VALIDATORS)
    6. Run unit tests
```

### Build Job (Only Runs if Tests Pass)

```yaml
build:
  name: Build and Push Docker Image
  needs: test  # Depends on test job
  
  steps:
    - Build and push Docker image
```

### Deploy Job (Only Runs if Build Succeeds)

```yaml
deploy:
  name: Deploy to DigitalOcean
  needs: build
  
  steps:
    - Deploy container
```

## Pipeline Flow

```
┌──────────────────────────────────────────────┐
│  Push to development / Create PR             │
└──────────────┬───────────────────────────────┘
               │
               ▼
┌──────────────────────────────────────────────┐
│  TEST JOB                                    │
│  ├─ Build solution                           │
│  ├─ Check Validation Coverage                │
│  │   ├─ Scan all Commands                    │
│  │   ├─ Check for Validators                 │
│  │   └─ ❌ FAIL if missing                   │
│  └─ Run Tests                                │
└──────────────┬───────────────────────────────┘
               │ (Only if all pass)
               ▼
┌──────────────────────────────────────────────┐
│  BUILD JOB                                   │
│  └─ Build and push Docker image              │
└──────────────┬───────────────────────────────┘
               │ (Only on push/manual)
               ▼
┌──────────────────────────────────────────────┐
│  DEPLOY JOB                                  │
│  └─ Deploy to DigitalOcean droplet           │
└──────────────────────────────────────────────┘
```

## Workflows Updated

### 1. deploy-tenant-api-dev.yml

- **Triggers:** Push/PR to development (TenantManagement/, ERPEZ.Shared/)
- **Runner:** ubuntu-latest
- **Added:** Test job with validation check
- **Impact:** TenantManagement API deployments

### 2. deploy-erpez-api-dev.yml

- **Triggers:** Push/PR to development (ERPEZ/, ERPEZ.Shared/)
- **Runner:** ubuntu-latest
- **Added:** Test job with validation check
- **Impact:** ERPEZ API deployments

## Validation Check Details

### Script Used

```bash
bash scripts/check-validators.sh
```

### What It Checks

- All `*Command.cs` files in `Features/**/Commands/**`
- Corresponding `*CommandValidator.cs` files
- Generates coverage report

### Exit Codes

- **0** = All commands have validators (✅ Pipeline continues)
- **1** = Missing validators (❌ Pipeline fails)

### Example Output in CI/CD

```
Scanning for Commands without Validators...
-------------------------------------------

✓ FOUND    - CreateTenantCommand.cs
✗ MISSING  - UpdateTenantCommand.cs
  Expected: UpdateTenantCommandValidator.cs

======================================
  Summary
======================================

Commands:
  Total: 15
  With Validators: 14
  Missing Validators: 1
  Coverage: 93.33%

❌ Action Required: 1 command(s) need validators!
```

## Fixing Pipeline Failures

### If Validation Check Fails

**Error Message:**

```
Error: Process completed with exit code 1.
```

**Resolution:**

1. Check the job logs for missing validators
2. Add the required validator classes
3. Push the changes
4. Pipeline will re-run automatically

### Quick Fix Steps

```bash
# 1. Run locally to see what's missing
./scripts/check-validators.sh

# 2. Generate templates (PowerShell)
.\scripts\check-validators.ps1
# Answer "Y" when prompted

# 3. Fill in validation rules
# Edit the generated *Validator.cs files

# 4. Test locally
./scripts/check-validators.sh

# 5. Commit and push
git add .
git commit -m "Add missing validators"
git push
```

## PR Workflow

### When Creating a PR

1. **Before pushing:**

   ```bash
   # Check locally first
   ./scripts/check-validators.sh
   ```

2. **After creating PR:**
   - GitHub Actions automatically runs
   - Check status on PR page
   - Green check = validation passed
   - Red X = validation failed

3. **If checks fail:**
   - Click "Details" to see logs
   - Fix missing validators
   - Push fix to PR branch
   - Checks re-run automatically

### Merge Requirements

PRs **cannot be merged** until:

- ✅ All validation checks pass
- ✅ All tests pass
- ✅ Build succeeds

## Local Development vs CI/CD

### Local Development

- Run `check-validators.ps1` (interactive, can generate templates)
- Optional but recommended before committing

### CI/CD Pipeline

- Runs `check-validators.sh` (non-interactive, fails build)
- Mandatory for all PRs and deployments

## Bypassing Checks (Not Recommended)

### For Emergency Hotfixes Only

If you need to bypass validation checks temporarily:

1. **Comment out the validation step in workflow:**

   ```yaml
   # - name: Check Validation Coverage
   #   run: bash scripts/check-validators.sh
   ```

2. **Create issue to add validators:**
   - Document which validators are missing
   - Assign to team member
   - Link to the PR

3. **Add validators ASAP**

## Monitoring and Alerts

### GitHub Actions Tab

- View all workflow runs
- Filter by status (success/failure)
- Check logs for details

### Slack/Email Notifications (if configured)

- Configure in GitHub Settings → Webhooks
- Get notified on build failures

## Best Practices

### ✅ DO

- Run validation check locally before pushing
- Create validators at the same time as commands
- Keep validation coverage at 100%
- Review logs when checks fail

### ❌ DON'T

- Push without running local checks
- Comment out validation steps in CI/CD
- Merge PRs with failing validation
- Create commands without validators

## Troubleshooting

### "Error: Application directory not found"

**Cause:** Script running from wrong directory
**Fix:** Workflow runs from repo root (correct)

### "Permission denied" on bash script

**Cause:** Script not executable
**Fix:** Git should preserve executable bit; if not:

```bash
chmod +x scripts/check-validators.sh
git add scripts/check-validators.sh --chmod=+x
```

### Script passes locally but fails in CI

**Cause:** Different paths or case sensitivity
**Fix:** Ensure paths use forward slashes and correct casing

### False positives (Delete commands)

**Cause:** Delete commands may not need validators
**Fix:** Document in command file why validator is skipped

```csharp
/// <summary>
/// Delete command - No validator needed (only accepts ID)
/// </summary>
public class DeleteTenantCommand : IRequest<ApiResponse<bool>>
{
    public Guid Id { get; set; }
}
```

## Coverage Goals

### Current Coverage

Run this to see current status:

```bash
./scripts/check-validators.sh
```

### Target Coverage

- **Minimum:** 80% (to pass CI/CD)
- **Goal:** 95%
- **Ideal:** 100%

### Exemptions

Document exemptions in code comments:

- Delete commands with only ID
- Internal/system commands
- Read-only queries with no input validation needs

## Support

### Getting Help

1. Check `VALIDATION_GUIDE.md` for implementation help
2. Check `VALIDATION_CHECK_INSTRUCTIONS.md` for review guidelines
3. Review `CreateTenantCommandValidator.cs` as example
4. Ask in team chat/stand-up

### Reporting Issues

If you believe the validation check is incorrectly failing:

1. Capture the CI/CD logs
2. Run locally and compare results
3. Create GitHub issue with details
4. Tag as `ci-cd` and `validation`

## Future Enhancements

### Planned

- [ ] Minimum coverage threshold (currently any missing = fail)
- [ ] Coverage trending dashboard
- [ ] Automatic validator generation on PR creation
- [ ] Validator quality checks (not just presence)

---

**Last Updated:** November 4, 2025
**Applies to:** development branch
**CI/CD Platform:** GitHub Actions
