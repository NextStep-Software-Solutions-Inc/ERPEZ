# FluentValidation Enforcement - GitHub Copilot Instructions

## Critical Rule: All Commands MUST Have Validators

When creating or modifying any `IRequest<T>` command class in the `Features/**/Commands/**` folders, you MUST also create a corresponding FluentValidation validator class.

## Validation Rules

### 1. Command Detection
If you see or create a file matching these patterns:
- `*Command.cs` in `Features/**/Commands/**`
- Class implements `IRequest<T>` or `IRequest<ApiResponse<T>>`
- Contains properties that accept user input

**ACTION REQUIRED:** Create a corresponding validator.

### 2. Validator Class Requirements

For every command like `CreateTenantCommand.cs`, create `CreateTenantCommandValidator.cs` in the SAME folder:

```csharp
using FluentValidation;

namespace YourNamespace.Features.Entity.Commands.CreateEntity;

/// <summary>
/// Validator for CreateEntityCommand ensuring all user input meets business requirements.
/// </summary>
public class CreateEntityCommandValidator : AbstractValidator<CreateEntityCommand>
{
    public CreateEntityCommandValidator()
    {
        // Add validation rules for ALL properties
        RuleFor(x => x.PropertyName)
            .NotEmpty()
            .WithMessage("PropertyName is required.");
            
        // Example: Email validation
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .WithMessage("Valid email is required.");
            
        // Example: String length
        RuleFor(x => x.Name)
            .NotEmpty()
            .MinimumLength(3)
            .MaximumLength(100)
            .WithMessage("Name must be between 3 and 100 characters.");
    }
}
```

### 3. When to Create Validators

**ALWAYS create validators for:**
- ✅ `Create*Command` - All create operations
- ✅ `Update*Command` - All update operations
- ✅ Commands with string, email, phone, URL properties
- ✅ Commands with numeric ranges or constraints
- ✅ Commands with enum values
- ✅ Commands with date ranges

**MAY skip validators for:**
- ⚠️ `Delete*Command` with only a Guid ID (but document why)
- ⚠️ Internal/system commands not triggered by user input

### 4. Validation Coverage Standards

Every validator must validate:
- **Required fields:** Use `.NotEmpty()`
- **String lengths:** Use `.MinimumLength()` and `.MaximumLength()`
- **Email addresses:** Use `.EmailAddress()`
- **Enums:** Validate enum values are valid
- **Formats:** Use `.Matches()` for patterns
- **Business rules:** Use `.Must()` for custom logic

### 5. Error Messages

All validation rules must have clear, user-friendly error messages:

```csharp
// ✅ GOOD
.WithMessage("Tenant name must be between 3 and 100 characters.");

// ❌ BAD
.WithMessage("Invalid input.");
```

## Auto-Check Process

Before suggesting any command class, run this mental checklist:

1. **Is this a Command class?** (implements IRequest<T>)
2. **Does it accept user input?** (has settable properties)
3. **Does a validator exist?** (check for *Validator.cs in same folder)
4. **If NO validator exists:** Create one immediately

## Example: Complete Implementation

When a user asks to create a command:

```csharp
// 1. Create the Command
public class CreateProductCommand : IRequest<ApiResponse<Guid>>
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public required string Category { get; set; }
}

// 2. IMMEDIATELY Create the Validator (same folder)
public class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Product name is required.")
            .MinimumLength(3).WithMessage("Product name must be at least 3 characters.")
            .MaximumLength(200).WithMessage("Product name cannot exceed 200 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Price must be greater than zero.");

        RuleFor(x => x.Category)
            .NotEmpty().WithMessage("Category is required.")
            .MaximumLength(50).WithMessage("Category cannot exceed 50 characters.");
    }
}

// 3. Create the Handler (as usual)
public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, ApiResponse<Guid>>
{
    // Handler implementation
}
```

## CI/CD Integration

The project has automated validation coverage checks:
- **Script:** `scripts/check-validators.sh`
- **Runs on:** Every push and pull request
- **Fails if:** Any command is missing a validator
- **Action:** Build will fail in CI/CD pipeline

### Warnings as Errors (Enforced in CI)

All CI builds treat compiler warnings as errors. Copilot must avoid producing code that generates compiler warnings and should proactively fix or suggest fixes for any warnings that would be produced by the generated code. Specifically:

- CI build commands include the MSBuild property `TreatWarningsAsErrors=true` or the equivalent `-warnaserror` flag.
- Generated code must compile with zero warnings on .NET 9.0 with the project `Release` configuration.
- If Copilot suggests code that could produce warnings (unused usings, obsolete APIs, implicit type usages that cause warnings, nullable-reference misuse, etc.), it should include fixes or comments explaining how to avoid the warning.

This policy ensures the pipeline fails on warnings so we keep the codebase clean and prevent regressions.

## References

- **Implementation Guide:** See `VALIDATION_GUIDE.md` for detailed examples
- **Check Instructions:** See `VALIDATION_CHECK_INSTRUCTIONS.md` for manual review
- **Example Validator:** See `CreateTenantCommandValidator.cs` for reference

## Copilot Response Template

When creating a command, always respond with:

```markdown
I've created the following files:

1. **CreateEntityCommand.cs** - The command class
2. **CreateEntityCommandValidator.cs** ✅ - The validator (REQUIRED)
3. **CreateEntityCommandHandler.cs** - The handler

The validator includes:
- [List validation rules applied]

Note: The validator is required for CI/CD pipeline to pass.
```

## Enforcement

If a user asks you to create a command WITHOUT mentioning a validator:
1. Create BOTH the command and validator automatically
2. Explain why the validator is required
3. Reference the validation guide for more details

## Common Patterns

### String Property
```csharp
RuleFor(x => x.PropertyName)
    .NotEmpty()
    .MinimumLength(min)
    .MaximumLength(max)
    .WithMessage("Clear message");
```

### Email Property
```csharp
RuleFor(x => x.Email)
    .NotEmpty()
    .EmailAddress()
    .MaximumLength(255)
    .WithMessage("Valid email required");
```

### Enum Property
```csharp
RuleFor(x => x.Status)
    .IsInEnum()
    .WithMessage("Invalid status value");
```

### Optional Property
```csharp
RuleFor(x => x.OptionalField)
    .MaximumLength(max)
    .When(x => !string.IsNullOrWhiteSpace(x.OptionalField));
```

### Numeric Range
```csharp
RuleFor(x => x.Quantity)
    .GreaterThan(0)
    .LessThanOrEqualTo(1000)
    .WithMessage("Quantity must be between 1 and 1000");
```

## Summary

**NEVER create a Command without its Validator.**

This is enforced by:
- ✅ CI/CD pipeline (fails build)
- ✅ Code review process
- ✅ Automated scripts
- ✅ This Copilot instruction

Always create validators alongside commands to maintain code quality and prevent CI/CD failures.
