# Validation Scripts

This folder contains automated scripts to check and maintain code quality standards across the application.

## Scripts

### check-validators.ps1 (Windows/PowerShell)

Checks all Commands and Queries for corresponding FluentValidation validators.

**Usage:**

```powershell
# Run from project root
.\scripts\check-validators.ps1

# Or with execution policy bypass
powershell -ExecutionPolicy Bypass -File .\scripts\check-validators.ps1
```

**Features:**

- ✅ Scans all Commands in the Features folder
- ✅ Identifies missing validator classes
- ✅ Provides detailed coverage report
- ✅ Can auto-generate validator template files
- ✅ Color-coded output for easy reading

### check-validators.sh (Linux/Mac/Bash)

Bash version of the validator checker script.

**Usage:**

```bash
# Make executable
chmod +x scripts/check-validators.sh

# Run from project root
./scripts/check-validators.sh
```

## What the Scripts Check

### Commands (MUST have validators)

All commands that:

- Accept user input
- Perform Create/Update operations
- Contain properties with validation requirements

### Queries (SHOULD have validators if complex)

Queries that:

- Have multiple filter parameters
- Accept user search input
- Have business rule constraints

### Delete Commands (Optional)

Delete commands with only an ID parameter may skip validators, but should document why.

---

### check-dto-contracts.sh (Linux/Mac/Bash)

Detects queries and commands that return domain entities instead of DTOs, preventing API contract violations.

**Usage:**

```bash
# Make executable
chmod +x scripts/check-dto-contracts.sh

# Run from project root
./scripts/check-dto-contracts.sh
```

**Features:**

- ✅ Scans all Queries and Commands
- ✅ Detects `Domain.Entities.*` in return types
- ✅ Ensures clean architecture separation
- ✅ Prevents domain entity leakage through API
- ✅ Color-coded output for violations

### check-dto-contracts.ps1 (Windows/PowerShell)

PowerShell version of the DTO contract checker.

**Usage:**

```powershell
# Run from project root
.\scripts\check-dto-contracts.ps1

# Or with execution policy bypass
powershell -ExecutionPolicy Bypass -File .\scripts\check-dto-contracts.ps1
```

**What It Checks:**

The script ensures that:

- ❌ Queries/Commands do NOT return `ApiResponse<Domain.Entities.*>`
- ❌ Queries do NOT return `PaginatedApiResponse<Domain.Entities.*>`
- ✅ All return types use proper DTO classes (e.g., `LocationResponse`, `ObjectDetailedResponse`)

**Example Violations:**

```csharp
// ❌ BAD - Returns domain entity
public record GetLocationByIdQuery(Guid Id) 
    : IRequest<ApiResponse<Domain.Entities.Planning.Location>>;

// ✅ GOOD - Returns DTO
public record GetLocationByIdQuery(Guid Id) 
    : IRequest<ApiResponse<LocationDetailedResponse>>;
```

---

## Output Example

```text
======================================
  Validation Coverage Check
======================================

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
  With Validators: 1
  Missing Validators: 14
  Coverage: 6.67%
```

## Auto-Generate Templates

When the PowerShell script finds missing validators, it offers to generate template files:

```text
Generate validator template files? (Y/N): Y
```

This creates basic validator classes with:

- Proper namespace
- Correct class name
- Inherits from AbstractValidator&lt;T&gt;
- TODO comments for adding rules

**Example Generated Template:**

```csharp
using FluentValidation;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Commands.UpdateTenant;

/// <summary>
/// Validator for UpdateTenantCommand.
/// TODO: Add validation rules
/// </summary>
public class UpdateTenantCommandValidator : AbstractValidator<UpdateTenantCommand>
{
    public UpdateTenantCommandValidator()
    {
        // TODO: Add validation rules here
        // Example:
        // RuleFor(x => x.PropertyName)
        //     .NotEmpty()
        //     .WithMessage("PropertyName is required.");
    }
}
```

## Integration with Development Workflow

### 1. Before Committing

Run the script to check validation coverage:

```powershell
.\scripts\check-validators.ps1
```

### 2. After Creating a New Command

Immediately create the corresponding validator or document why it's not needed.

### 3. During Code Review

Reviewer should verify:

- Validator exists for the command
- Validation rules cover all required fields
- Error messages are clear and user-friendly

### 4. CI/CD Pipeline

The scripts are integrated into the GitHub Actions CI/CD pipeline and run automatically on every push and pull request:

```yaml
# .github/workflows/deploy-erpez-api-dev.yml
- name: Check Validation Coverage
  run: |
    echo "Checking FluentValidation coverage..."
    bash scripts/check-validators.sh
  shell: bash
  continue-on-error: false

- name: Check DTO Contract Compliance
  run: |
    echo "Checking API contract compliance..."
    bash scripts/check-dto-contracts.sh
  shell: bash
  continue-on-error: false
```

**Pipeline Behavior:**

- ✅ Build fails if any Command is missing a validator
- ✅ Build fails if any Query/Command returns a domain entity
- ✅ Runs after build but before tests
- ✅ Prevents non-compliant code from being deployed

### 5. Local Development

Run both scripts before committing:

```bash
# Linux/Mac
./scripts/check-validators.sh
./scripts/check-dto-contracts.sh

# Windows PowerShell
.\scripts\check-validators.ps1
.\scripts\check-dto-contracts.ps1
```

## Exit Codes

Both scripts use the following exit codes:

- **0**: All checks passed (success)
- **1**: One or more violations found (failure)

## Related Documentation

- **VALIDATION_GUIDE.md** - Complete guide to implementing FluentValidation
- **VALIDATION_CHECK_INSTRUCTIONS.md** - Manual review checklist and procedures
- **CreateTenantCommandValidator.cs** - Example validator implementation

## Troubleshooting

### Script doesn't find Application folder

Make sure you're running from the project root directory (where ERPEZ.sln is located).

### Permission denied on bash script

```bash
chmod +x scripts/check-validators.sh
```

### PowerShell execution policy error

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\check-validators.ps1
```

### False positives

If a command legitimately doesn't need a validator (e.g., simple Delete with just ID), document this in the command file with a comment:

```csharp
/// <summary>
/// Delete command - No validator needed (only accepts ID)
/// </summary>
public class DeleteTenantCommand : IRequest<ApiResponse<bool>>
{
    public Guid Id { get; set; }
}
```

## Customization

You can modify the scripts to:

- Change the threshold for acceptable coverage
- Add custom validators for specific patterns
- Skip certain folders or commands
- Customize the generated template

## Support

For questions or issues with these scripts, contact the development team or refer to the VALIDATION_GUIDE.md documentation.
