# FluentValidation Implementation Guide

## Overview

This document explains the FluentValidation implementation in the ERPEZ TenantManagement application, using the `CreateTenantCommand` as an example. This implementation follows SOLID principles and the existing codebase patterns.

## Architecture

The validation implementation consists of three main components:

### 1. Validator Classes

Located in the same folder as the command they validate.

**Example:** `CreateTenantCommandValidator.cs`

```csharp
public class CreateTenantCommandValidator : AbstractValidator<CreateTenantCommand>
{
    public CreateTenantCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Tenant name is required.")
            .MinimumLength(3).WithMessage("Tenant name must be at least 3 characters.")
            .MaximumLength(100).WithMessage("Tenant name cannot exceed 100 characters.");
        
        RuleFor(x => x.BillingContactEmail)
            .NotEmpty().WithMessage("Billing contact email is required.")
            .EmailAddress().WithMessage("Must be a valid email address.");
    }
}
```

### 2. Validation Pipeline Behavior

Located in `Application/Common/Behaviors/ValidationBehavior.cs`

This is a MediatR pipeline behavior that automatically validates all requests that have validators registered. It:

- Runs **before** the command handler
- Collects validation failures from all validators
- Throws `FluentValidation.ValidationException` if validation fails
- Allows the request to proceed if validation passes

**Key Benefits:**

- **Single Responsibility:** Validation logic is separate from business logic
- **Open/Closed Principle:** Add new validators without modifying existing code
- **Don't Repeat Yourself (DRY):** Validation logic is centralized

### 3. Global Exception Handler

Located in `ERPEZ.Shared/Middlewares/GlobalExceptionHandler.cs`

Catches `FluentValidation.ValidationException` and transforms it into a standardized API response with:

- HTTP 400 Bad Request status
- Structured error messages grouped by property name
- Consistent `ApiResponse<object>.Fail()` format

## Setup and Configuration

### 1. Add NuGet Packages

**Application Project:**

```xml
<PackageReference Include="FluentValidation" Version="11.9.2" />
<PackageReference Include="FluentValidation.DependencyInjectionExtensions" Version="11.9.2" />
```

**Shared Project** (for exception handling):

```xml
<PackageReference Include="FluentValidation" Version="11.9.2" />
```

### 2. Register Services in DependencyInjection.cs

```csharp
public static IServiceCollection AddApplicationServices(this IServiceCollection services)
{
    var assembly = Assembly.GetExecutingAssembly();

    // Register MediatR with validation behavior
    services.AddMediatR(config =>
    {
        config.RegisterServicesFromAssembly(assembly);
        config.AddOpenBehavior(typeof(ValidationBehavior<,>));
    });

    // Auto-register all validators from the assembly
    services.AddValidatorsFromAssembly(assembly);

    return services;
}
```

## How to Add Validation to a New Command

### Step 1: Create a Validator Class

Create a new file in the same folder as your command, named `{CommandName}Validator.cs`:

```csharp
using FluentValidation;

namespace YourNamespace.Commands.YourCommand;

public class YourCommandValidator : AbstractValidator<YourCommand>
{
    public YourCommandValidator()
    {
        // Add validation rules here
        RuleFor(x => x.PropertyName)
            .NotEmpty()
            .WithMessage("Custom error message");
    }
}
```

### Step 2: Define Validation Rules

Use FluentValidation's fluent API to define rules:

```csharp
// Required fields
RuleFor(x => x.Name)
    .NotEmpty()
    .WithMessage("Name is required.");

// String length
RuleFor(x => x.Description)
    .MaximumLength(500)
    .WithMessage("Description cannot exceed 500 characters.");

// Email validation
RuleFor(x => x.Email)
    .EmailAddress()
    .WithMessage("Must be a valid email address.");

// Custom regex
RuleFor(x => x.PhoneNumber)
    .Matches(@"^\+?[1-9]\d{1,14}$")
    .WithMessage("Must be a valid phone number.");

// Conditional validation
RuleFor(x => x.OptionalField)
    .MaximumLength(100)
    .When(x => !string.IsNullOrWhiteSpace(x.OptionalField));

// Custom validation logic
RuleFor(x => x.StartDate)
    .Must(date => date > DateTime.UtcNow)
    .WithMessage("Start date must be in the future.");
```

### Step 3: Test Your Validation

That's it! The validation will automatically run when the command is sent through MediatR.

## Common Validation Rules

### String Validation

```csharp
RuleFor(x => x.Name)
    .NotEmpty()                                    // Required
    .MinimumLength(3)                              // Min length
    .MaximumLength(100)                            // Max length
    .Matches(@"^[a-zA-Z0-9\s]+$")                 // Regex pattern
    .EmailAddress()                                // Email format
    .Must(name => !name.Contains("spam"))         // Custom logic
    .WithMessage("Custom error message");
```

### Numeric Validation

```csharp
RuleFor(x => x.Age)
    .GreaterThan(0)
    .LessThanOrEqualTo(120)
    .WithMessage("Age must be between 1 and 120");
```

### Date Validation

```csharp
RuleFor(x => x.BirthDate)
    .LessThan(DateTime.UtcNow)
    .WithMessage("Birth date must be in the past");
```

### Conditional Validation

```csharp
RuleFor(x => x.CompanyName)
    .NotEmpty()
    .When(x => x.IsCompany)
    .WithMessage("Company name is required for company accounts");
```

### Collection Validation

```csharp
RuleFor(x => x.Items)
    .NotEmpty()
    .WithMessage("At least one item is required");

RuleForEach(x => x.Items)
    .SetValidator(new ItemValidator());
```

### Async Validation (for database checks)

```csharp
RuleFor(x => x.Email)
    .MustAsync(async (email, cancellation) => 
    {
        return !await _repository.EmailExistsAsync(email, cancellation);
    })
    .WithMessage("Email is already in use");
```

## Response Format

When validation fails, the API returns:

```json
{
  "succeeded": false,
  "message": "Validation failed",
  "data": null
}
```

HTTP Status: **400 Bad Request**

The detailed validation errors are available in the response headers or can be included in the response body if needed.

## Best Practices

### 1. Keep Validators Simple and Focused

- One validator per command/query
- Validate format and structure, not business rules
- Business rules belong in the domain or handler

### 2. Use Meaningful Error Messages

```csharp
// Good
.WithMessage("Tenant name must be between 3 and 100 characters.")

// Bad
.WithMessage("Invalid input.")
```

### 3. Don't Duplicate Database Checks

If the handler already checks for duplicates, don't add async validation for it. Let the handler throw a domain exception (like `ConflictException`).

### 4. Organize Validation Rules Logically

Group related rules together and add comments:

```csharp
public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserCommandValidator()
    {
        // Basic information
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(50);
        
        // Contact information
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Phone).Matches(@"^\+?[1-9]\d{1,14}$");
    }
}
```

### 5. Reuse Validation Logic

Create custom validators for common patterns:

```csharp
public static class CustomValidators
{
    public static IRuleBuilderOptions<T, string> IsValidTenantName<T>(
        this IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder
            .NotEmpty()
            .MinimumLength(3)
            .MaximumLength(100)
            .Matches(@"^[a-zA-Z0-9\s\-_\.]+$")
            .WithMessage("Invalid tenant name format");
    }
}

// Usage:
RuleFor(x => x.Name).IsValidTenantName();
```

## Testing Validators

Example unit test structure:

```csharp
public class CreateTenantCommandValidatorTests
{
    private readonly CreateTenantCommandValidator _validator;

    public CreateTenantCommandValidatorTests()
    {
        _validator = new CreateTenantCommandValidator();
    }

    [Fact]
    public void Should_Have_Error_When_Name_Is_Empty()
    {
        var command = new CreateTenantCommand { Name = "" };
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Should_Not_Have_Error_When_Valid()
    {
        var command = new CreateTenantCommand 
        { 
            Name = "Valid Tenant",
            BillingContactEmail = "test@example.com"
        };
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }
}
```

## Integration with Existing Code

The validation system integrates seamlessly with:

- **MediatR:** Validation runs automatically in the pipeline
- **Global Exception Handler:** Converts validation errors to API responses
- **ApiResponse:** Uses the existing `ApiResponse<T>.Fail()` pattern
- **Existing Exceptions:** Works alongside `ConflictException`, `NotFoundException`, etc.

## SOLID Principles Applied

- **Single Responsibility:** Each validator handles validation for one command
- **Open/Closed:** Add new validators without modifying the pipeline behavior
- **Liskov Substitution:** All validators implement `IValidator<T>`
- **Interface Segregation:** Validators only implement what they need
- **Dependency Inversion:** Handlers depend on abstractions, not concrete validators

## Summary

This validation implementation provides:

- ✅ Automatic validation for all commands
- ✅ Consistent error responses
- ✅ Clean separation of concerns
- ✅ Easy to test and maintain
- ✅ Follows SOLID principles
- ✅ Integrates with existing patterns

To add validation to any new command, simply create a validator class and define your rules. The pipeline will handle the rest automatically!
