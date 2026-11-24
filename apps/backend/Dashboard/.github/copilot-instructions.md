# Copilot Instructions for ERPEZ Backend

This document defines coding standards and architectural patterns for the ERPEZ (ERP System) backend. Follow these guidelines for all code generation and modifications.

---

## Tech Stack & Architecture

### Core Technologies
- **Framework**: ASP.NET Core 10.0 (net10.0)
- **Language**: C# with nullable reference types enabled
- **Architecture**: Clean Architecture (Onion Architecture)
  - **ERPEZ.Api**: Presentation layer (Controllers, Configuration, Middleware)
  - **ERPEZ.Application**: Business logic layer (Features, Commands, Queries, DTOs)
  - **ERPEZ.Domain**: Core domain layer (Entities, Interfaces, Enums)
  - **ERPEZ.Infrastructure**: Data access layer (Persistence, Repositories, External services)

### Key Libraries & Patterns
- **CQRS**: MediatR (v13.0.0) for Command Query Responsibility Segregation
- **Validation**: FluentValidation (v12.1.0) with ValidationBehavior pipeline
- **ORM**: Entity Framework Core 9.0.9 with PostgreSQL (Npgsql)
- **Authentication**: JWT Bearer tokens
- **API Documentation**: Swagger/OpenAPI (Swashbuckle v9.0.4)
- **Filtering/Sorting**: Sieve (v2.5.5) for query filtering
- **File Storage**: Azure Blob Storage
- **Background Jobs**: Hangfire with PostgreSQL storage
- **Data Export**: CsvHelper, ClosedXML

---

## Project Structure & Organization

### Feature Organization
Organize features by domain area under `ERPEZ.Application/Features/{Domain}/{Feature}/`:
```
Features/Planning/KPI/
├── Commands/
│   ├── CreateKPI/
│   │   ├── CreateKPICommand.cs
│   │   ├── CreateKPICommandHandler.cs
│   │   └── CreateKPICommandValidator.cs
│   ├── UpdateKPI/
│   └── DeleteKPI/
├── Queries/
│   ├── GetKPIs/
│   └── GetKPIById/
└── Dtos/
    ├── KPIResponse.cs
    └── KPIDetailedResponse.cs
```

### Naming Conventions

#### Routes (Controllers)
- Use **lowercase with hyphens** for route names
- Use **plural nouns** for resource collections
- Examples:
  - `[Route("kpis")]`
  - `[Route("delivery-units")]`
  - `[Route("fiscal-years")]`
  - `[Route("opcr-activities")]`

#### Controllers
- Format: `{Resource}Controller` (e.g., `KPIController`, `FiscalYearController`)
- Use **primary constructor dependency injection**:
  ```csharp
  public class KPIController(ISender mediator) : ControllerBase
  ```
- Always inherit from `ControllerBase`
- Add `[ApiController]` attribute

#### Commands & Queries
- **Commands**: `{Verb}{Entity}Command` (e.g., `CreateKPICommand`, `UpdateKPICommand`)
- **Handlers**: `{Command}Handler` (e.g., `CreateKPICommandHandler`)
- **Validators**: `{Command}Validator` (e.g., `CreateKPICommandValidator`)
- **Queries**: `Get{Entity}Query`, `Get{Entity}ByIdQuery`

#### DTOs & Responses
- **Responses**: `{Entity}Response`, `{Entity}DetailedResponse`
- **Requests**: `{Verb}{Entity}Request` (e.g., `CreateKPIRequest`, `UpdateKPIRequest`)
- Use `record` types for DTOs when possible

#### Entities & Models
- Use **PascalCase** for all class names
- Entity files located in `ERPEZ.Domain/Entities/{Domain}/`
- All entities inherit from `BaseEntity`

#### Repositories
- Interface: `I{Entity}Repository` (e.g., `IKPIRepository`)
- Implementation: `{Entity}Repository`
- Located in `ERPEZ.Infrastructure/Persistence/Repositories/`

---

## Coding Standards

### Async/Await Patterns
- **ALWAYS** use async/await for I/O operations
- Controller actions must be async:
  ```csharp
  public async Task<IActionResult> CreateKPI([FromBody] CreateKPICommand command)
  {
      var result = await mediator.Send(command);
      return CreatedAtAction(nameof(GetKPIById), new { id = result.Data }, result);
  }
  ```
- Command/Query handlers must implement `IRequestHandler<TRequest, TResponse>` with async Handle method

### Dependency Injection
- Use **primary constructors** for all services, controllers, and handlers (C# 12 feature):
  ```csharp
  public class CreateKPICommandHandler(IUnitOfWork unitOfWork, IFileStorageService fileStorageService) 
      : IRequestHandler<CreateKPICommand, ApiResponse<Guid>>
  ```
- Register services in `DependencyInjection.cs` files within each layer
- Use `AddScoped` for repositories and DbContext
- Use extension methods for service registration:
  ```csharp
  builder.AddApiServices()
      .AddApplicationServices();
  await builder.AddInfrastructureServices();
  ```

### Error Handling
- Use **custom exception types** from `ERPEZ.Shared.Exceptions`:
  - `NotFoundException`: When entity not found
  - `ConflictException`: When duplicate/conflict exists
  - `ValidationException`: Thrown by FluentValidation
- Exceptions are caught by `GlobalExceptionHandler` middleware
- Return `ApiResponse<T>` or `PaginatedApiResponse<T>` wrapper types:
  ```csharp
  if (!result.Succeeded)
      return BadRequest(result);
  
  return result.Succeeded ? Ok(result) : NotFound(result);
  ```

### Response Types
- Use `ProducesResponseType` attributes for all endpoints:
  ```csharp
  [HttpPost]
  [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
  [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
  public async Task<IActionResult> CreateKPI([FromBody] CreateKPICommand command)
  ```
- Standard response codes:
  - `200 OK`: Successful GET/PUT
  - `201 Created`: Successful POST (use `CreatedAtAction`)
  - `204 NoContent`: Successful DELETE
  - `400 BadRequest`: Validation errors
  - `404 NotFound`: Entity not found

### Nullability
- Nullable reference types are **enabled** across all projects
- Use nullable annotations explicitly:
  - `string?` for nullable strings
  - `Guid?` for nullable identifiers
  - `= string.Empty` for non-null string initialization

---

## Data Validation & Types

### FluentValidation Rules
- Create a validator class for every Command:
  ```csharp
  public class CreateKPICommandValidator : AbstractValidator<CreateKPICommand>
  {
      public CreateKPICommandValidator()
      {
          RuleFor(x => x.Name)
              .NotEmpty()
              .WithMessage("KPI Name is required.")
              .MinimumLength(5)
              .WithMessage("KPI Name must be at least 5 characters long.")
              .MaximumLength(250)
              .WithMessage("KPI Name cannot exceed 250 characters.");
      }
  }
  ```
- Validators are automatically invoked by `ValidationBehavior<TRequest, TResponse>` pipeline
- Use `.When()` for conditional validation
- Validate enum values against allowed types

### DTOs for Request/Response
- **Commands** serve as request DTOs (inherit from `IRequest<ApiResponse<T>>`)
- **Response DTOs** use `record` types:
  ```csharp
  public record KPIResponse
  {
      public Guid Id { get; init; }
      public string Name { get; init; } = string.Empty;
      public DateTime CreatedAt { get; init; }
      public List<KPITargetResponse> KPITargets { get; init; } = [];
  }
  ```
- Use `[JsonPropertyName("PropertyName")]` for nested collections/objects to ensure correct serialization
- Initialize collections with `= []` (C# 12 collection expression)

### Request Binding
- Use `[FromBody]` for POST/PUT payloads
- Use `[FromQuery]` for GET query parameters
- Use `[FromRoute]` for path parameters (often implicit)
- Use `[FromForm]` for file uploads

---

## Database Guidelines

### Entity Framework Core
- **DbContext**: `ApplicationDbContext` in `ERPEZ.Infrastructure/Persistence/`
- **Connection**: PostgreSQL via Npgsql provider
- All entities use `Guid` primary keys (not auto-increment)

### Entity Conventions
- Inherit from `BaseEntity` which provides:
  ```csharp
  public Guid Id { get; set; }
  public DateTime CreatedAt { get; set; }
  public string CreatedBy { get; set; } = string.Empty;
  public DateTime? UpdatedAt { get; set; }
  public string? UpdatedBy { get; set; }
  public bool IsDeleted { get; set; }
  public DateTime? DeletedAt { get; set; }
  public string? DeletedBy { get; set; }
  ```
- Use `[Sieve(CanFilter = true, CanSort = true)]` attributes for filterable/sortable properties
- Use virtual properties for navigation properties:
  ```csharp
  public virtual KPI? ParentKPI { get; set; }
  public virtual List<KPIModeOfVerification> KPIModeOfVerifications { get; set; } = [];
  ```

### Migration Safety
- **ALWAYS** create migrations with descriptive names:
  ```bash
  dotnet ef migrations add AddObjectChildCode --project ERPEZ.Infrastructure
  ```
- Migrations are in `ERPEZ.Infrastructure/Migrations/`
- Review migrations before applying to production
- Include both `Up()` and `Down()` methods
- In development, `PendingModelChangesWarning` is ignored

### Repository Pattern
- Use `IUnitOfWork` pattern for transaction management
- Repositories provide:
  - `GetByIdAsync()`, `FindAsync()`, `ToListAsync()`
  - `AddAsync()`, `UpdateAsync()`, `DeleteAsync()`
  - `Query()` for IQueryable access
- Access repositories via `IUnitOfWork`:
  ```csharp
  var existingKpi = await unitOfWork.KPIRepository.FindAsync(
      x => x.Name == request.Name && x.FunctionType == request.FunctionType,
      cancellationToken
  );
  ```

### Naming Conventions
- **DbSet Properties**: Plural (e.g., `DbSet<KPI> KPIs`)
- **Table Names**: PascalCase plural (e.g., `KPIs`, `OPCRActivities`)
- **Column Names**: PascalCase (matches entity properties)
- **Foreign Keys**: `{Entity}Id` (e.g., `ParentKPIId`, `MFOPAPId`)
- **Join Tables**: `{Entity1}{Entity2}` (e.g., `KPIPerformanceMeasure`)

---

## Additional Standards

### CQRS & MediatR
- Separate **Commands** (write operations) from **Queries** (read operations)
- Commands return `ApiResponse<T>` or `ApiResponse<Unit>` for updates
- Queries return `ApiResponse<T>` or `PaginatedApiResponse<T>`
- Send requests via `ISender` (MediatR abstraction):
  ```csharp
  var result = await mediator.Send(command);
  ```

### Middleware Pipeline Order
1. Exception handling (`app.UseExceptionHandler()`)
2. HTTPS redirection
3. Swagger (development only)
4. CORS
5. Response caching
6. Response compression
7. Authentication
8. Authorization
9. Endpoint mapping (`app.MapControllers()`)

### Configuration
- Use `appsettings.json`, `appsettings.Development.json`, `appsettings.Production.json`
- Sensitive values stored in **User Secrets** (development) or environment variables (production)
- Configuration bound to strongly-typed options classes
- Extension methods in `ERPEZ.Api/Extensions/` for configuration setup

### Swagger Configuration
- Use fully-qualified type names as schema IDs to prevent conflicts:
  ```csharp
  c.CustomSchemaIds(type => type.FullName?.Replace('+', '.') ?? type.Name);
  ```
- Register file upload filter: `c.OperationFilter<SwaggerFileOperationFilter>()`
- Add JWT security definition for authorization testing

---

## Best Practices Summary

✅ **DO**:
- Use primary constructors for dependency injection
- Always use async/await for I/O operations
- Create FluentValidation validators for all commands
- Use `record` types for DTOs
- Throw custom exceptions (`NotFoundException`, `ConflictException`)
- Use `ApiResponse<T>` wrappers for controller responses
- Organize features by domain in separate folders
- Use lowercase-hyphen route names
- Include `ProducesResponseType` attributes on all endpoints
- Validate enum values in validators
- Use `CancellationToken` in all async operations

❌ **DON'T**:
- Use blocking I/O operations (`.Result`, `.Wait()`)
- Return naked domain entities from controllers
- Put business logic in controllers
- Manually instantiate DbContext
- Use string-based exception messages for known error types
- Create migrations without descriptive names
- Use nullable types without explicit annotations

---

## Example: Complete Feature Implementation

### 1. Command (Application Layer)
```csharp
namespace ERPEZ.Application.Features.Planning.KPI.Commands.CreateKPI;

public record CreateKPICommand : IRequest<ApiResponse<Guid>>
{
    public string Name { get; init; } = string.Empty;
    public string FunctionType { get; init; } = string.Empty;
    public Guid? ParentKPIId { get; init; }
}
```

### 2. Validator (Application Layer)
```csharp
public class CreateKPICommandValidator : AbstractValidator<CreateKPICommand>
{
    public CreateKPICommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(250).WithMessage("Name cannot exceed 250 characters.");
    }
}
```

### 3. Handler (Application Layer)
```csharp
public class CreateKPICommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<CreateKPICommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateKPICommand request, CancellationToken cancellationToken)
    {
        var existing = await unitOfWork.KPIRepository.FindAsync(
            x => x.Name == request.Name, cancellationToken);
        
        if (existing != null)
            throw new ConflictException("KPI already exists.");
        
        var entity = new KPI 
        { 
            Id = Guid.NewGuid(),
            Name = request.Name,
            FunctionType = request.FunctionType
        };
        
        await unitOfWork.KPIRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        
        return ApiResponse<Guid>.Success(entity.Id);
    }
}
```

### 4. Controller (API Layer)
```csharp
namespace ERPEZ.Api.Controllers;

[Route("kpis")]
[ApiController]
public class KPIController(ISender mediator) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateKPI([FromBody] CreateKPICommand command)
    {
        var result = await mediator.Send(command);
        
        if (!result.Succeeded)
            return BadRequest(result);
        
        return CreatedAtAction(nameof(GetKPIById), new { id = result.Data }, result);
    }
}
```

---

**Last Updated**: February 2026  
**Target Framework**: .NET 10.0  
**Architecture**: Clean Architecture with CQRS
