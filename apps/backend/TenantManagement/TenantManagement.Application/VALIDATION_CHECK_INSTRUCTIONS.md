# Validation Check Instructions

## Purpose

This instruction file helps reviewers and developers verify that all user input forms (Commands, Queries, DTOs) have corresponding FluentValidation validator classes.

## What to Check

### 1. Commands That Require Validation

Any command that accepts user input and performs create/update operations MUST have a validator.

**Pattern to identify:**

- Classes implementing `IRequest<T>` in `Features/**/Commands/**` folders
- Contains properties that represent user input
- Performs data modification (Create, Update)

**Validation Rule:**

- Must have a corresponding `{CommandName}Validator.cs` file in the same folder
- Validator must inherit from `AbstractValidator<{CommandName}>`

### 2. Queries That Require Validation

Queries with complex input parameters should have validation.

**Pattern to identify:**

- Classes implementing `IRequest<T>` in `Features/**/Queries/**` folders
- Contains multiple filter/search parameters
- Has business logic constraints on parameters

**Validation Rule:**

- Should have a corresponding `{QueryName}Validator.cs` file if complex validation is needed
- Simple queries (GetById with just Guid) may skip validation

### 3. DTOs That Require Validation

DTOs used for updates or complex input should have validation.

**Pattern to identify:**

- DTO classes in `Features/**/Dtos/**` folders
- Used in `[FromBody]` parameters in controllers
- Contain updatable fields

**Validation Rule:**

- Should have inline validation attributes OR
- Should be validated through the command/query that uses them

## Validation Checklist

### For Each Command/Query File

```
☐ Does it accept user input? (Has properties with setters)
☐ Does it perform Create/Update operations?
☐ Is there a {Name}Validator.cs file in the same folder?
☐ Does the validator inherit from AbstractValidator<T>?
☐ Does the validator cover all required fields?
☐ Does the validator check business constraints?
```

### For Each Validator File

```
☐ Is it in the same folder as the command/query it validates?
☐ Does it inherit from AbstractValidator<T>?
☐ Does it validate all required properties?
☐ Are error messages clear and user-friendly?
☐ Are length constraints specified (where applicable)?
☐ Are format validations included (email, phone, etc.)?
☐ Are conditional validations handled properly?
```

## How to Find Missing Validators

### Option 1: Manual Review

1. Navigate to `Features` folder
2. Check each `Commands` subfolder
3. For each `*Command.cs` file, verify `*CommandValidator.cs` exists
4. Repeat for `Queries` if needed

### Option 2: Automated Script (PowerShell)

```powershell
# Find all commands without validators
$commands = Get-ChildItem -Path ".\TenantManagement\ERPEZ.TenantManagement.Application\Features" -Recurse -Filter "*Command.cs" | Where-Object { $_.Name -notmatch "Validator" }

foreach ($command in $commands) {
    $validatorName = $command.Name -replace "Command.cs", "CommandValidator.cs"
    $validatorPath = Join-Path $command.DirectoryName $validatorName
    
    if (-not (Test-Path $validatorPath)) {
        Write-Host "MISSING VALIDATOR: $($command.FullName)" -ForegroundColor Red
        Write-Host "  Expected: $validatorPath" -ForegroundColor Yellow
    }
}
```

### Option 3: Automated Script (Bash)

```bash
#!/bin/bash
# Find all commands without validators

find ./TenantManagement/ERPEZ.TenantManagement.Application/Features -name "*Command.cs" | while read command_file; do
    dir=$(dirname "$command_file")
    filename=$(basename "$command_file")
    validator_file="${filename/Command.cs/CommandValidator.cs}"
    validator_path="$dir/$validator_file"
    
    if [ ! -f "$validator_path" ]; then
        echo "MISSING VALIDATOR: $command_file"
        echo "  Expected: $validator_path"
    fi
done
```

## Exemptions (Commands That May Not Need Validators)

### Delete Commands

```csharp
// Typically only have an ID - may not need validation
public class DeleteTenantCommand : IRequest<ApiResponse<bool>>
{
    public Guid Id { get; set; }
}
```

### Simple Get Queries

```csharp
// Single ID lookup - may not need validation
public class GetTenantByIdQuery : IRequest<ApiResponse<TenantDto>>
{
    public Guid Id { get; set; }
}
```

### Internal/System Commands

```csharp
// Commands triggered by system, not user input
public class SyncTenantDataCommand : IRequest<ApiResponse<bool>>
{
    public DateTime LastSyncDate { get; set; }
}
```

## Red Flags (Must Have Validators)

❗ **String inputs without length validation**
❗ **Email fields without format validation**
❗ **Create commands without required field validation**
❗ **Update commands with no validation**
❗ **Enum values without validation**
❗ **Numeric ranges without min/max validation**

## Example: Complete Command with Validator

### ✅ Good Example

```
Features/
  Tenants/
    Commands/
      CreateTenant/
        ├── CreateTenantCommand.cs          ✓ Present
        ├── CreateTenantCommandHandler.cs   ✓ Present
        └── CreateTenantCommandValidator.cs ✓ Present (with proper validation)
```

### ❌ Bad Example

```
Features/
  Tenants/
    Commands/
      CreateTenant/
        ├── CreateTenantCommand.cs          ✓ Present
        ├── CreateTenantCommandHandler.cs   ✓ Present
        └── (missing validator)             ✗ MISSING!
```

## Validation Coverage Report Template

Use this template to report validation coverage:

```markdown
## Validation Coverage Report - [Date]

### Summary
- Total Commands: [X]
- Commands with Validators: [Y]
- Coverage: [Y/X * 100]%

### Commands WITHOUT Validators
1. CreateTenantCommand - CRITICAL (accepts user input)
2. UpdateTenantSettingCommand - CRITICAL (accepts user input)
3. DeleteTenantCommand - OK (only accepts ID)

### Queries WITHOUT Validators
1. GetTenantsByFilterQuery - RECOMMENDED (complex filters)
2. GetTenantByIdQuery - OK (simple ID lookup)

### Action Items
- [ ] Add validator for CreateTenantCommand
- [ ] Add validator for UpdateTenantSettingCommand
- [ ] Review GetTenantsByFilterQuery for validation needs
```

## Integration with CI/CD

### Pre-commit Hook

Add a git pre-commit hook to check for validators:

```bash
#!/bin/sh
# .git/hooks/pre-commit

echo "Checking for missing validators..."

missing_validators=0

# Check staged Command files
for file in $(git diff --cached --name-only --diff-filter=AM | grep "Command.cs$"); do
    if [[ ! "$file" =~ "Validator" ]]; then
        validator_file="${file/Command.cs/CommandValidator.cs}"
        if [ ! -f "$validator_file" ]; then
            echo "❌ Missing validator for: $file"
            echo "   Expected: $validator_file"
            missing_validators=$((missing_validators + 1))
        fi
    fi
done

if [ $missing_validators -gt 0 ]; then
    echo ""
    echo "⚠️  Found $missing_validators command(s) without validators!"
    echo "   Add validators or document why they're not needed."
    echo "   Use 'git commit --no-verify' to skip this check."
    exit 1
fi

echo "✅ All commands have validators"
exit 0
```

## Quick Reference

### Command Needs Validator If

- ✅ Has string properties with user input
- ✅ Performs Create or Update operations
- ✅ Has email, phone, or formatted fields
- ✅ Has business rule constraints
- ✅ Has numeric ranges or enums

### Command May Skip Validator If

- ⚪ Only has a single Guid ID
- ⚪ Is a Delete operation with just ID
- ⚪ Is system-triggered (not user input)
- ⚪ All validation is in the domain entity

## References

- See `VALIDATION_GUIDE.md` for implementation details
- See `CreateTenantCommandValidator.cs` for example implementation
- See `ValidationBehavior.cs` for pipeline integration

## Review Process

1. **During Development:**
   - Developer creates command → Developer creates validator
   - Developer runs validation check script
   - Developer commits both files together

2. **During Code Review:**
   - Reviewer checks for corresponding validator file
   - Reviewer verifies validation rules are complete
   - Reviewer ensures error messages are user-friendly

3. **During QA:**
   - QA tests validation by submitting invalid data
   - QA verifies appropriate error messages are returned
   - QA checks edge cases are handled

## Contact

For questions about validation requirements or exemptions, contact the technical lead or architecture team.

---

**Last Updated:** November 4, 2025
**Version:** 1.0
**Maintained by:** Development Team
