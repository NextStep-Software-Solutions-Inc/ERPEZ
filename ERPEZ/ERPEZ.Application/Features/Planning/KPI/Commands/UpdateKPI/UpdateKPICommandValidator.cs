using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.UpdateKPI;

public class UpdateKPICommandValidator : AbstractValidator<UpdateKPICommand>
{
    private readonly string[] ValidFunctionTypes =
    [
        "Core Function", "Strategic Priority", "Mandatory Support Functions"
    ];
    private readonly string[] ValidStatuses = ["Draft", "Submitted", "Approved", "Active", "Archived"]; // Added Active/Archived for typical update statuses

    public UpdateKPICommandValidator()
    {
        // 1. Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("KPI ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("KPI ID must be a valid, non-empty GUID.");

        // 2. ParentKPIId (Optional GUID?)
        RuleFor(x => x.UpdateKPI.ParentKPIId)
            .Must(id => !id.HasValue || id.Value != Guid.Empty)
            .WithMessage("If provided, the Parent KPI ID must be a valid, non-empty GUID.")
            .When(x => x.UpdateKPI.ParentKPIId.HasValue);

        // 3. Self-Parenting Check
        RuleFor(x => x.UpdateKPI.ParentKPIId)
            .NotEqual(x => x.Id)
            .When(x => x.UpdateKPI.ParentKPIId.HasValue)
            .WithMessage("A KPI cannot be its own parent.");

        // 4. FunctionType (Optional String?) - Check only if provided
        RuleFor(x => x.UpdateKPI.FunctionType)
            .MaximumLength(100)
            .WithMessage("Function Type cannot exceed 100 characters.")
            .Must(type => ValidFunctionTypes.Contains(type, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Function Type must be one of the following: {string.Join(", ", ValidFunctionTypes)}.")
            // Validation only runs if the string is NOT null or empty
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateKPI.FunctionType));

        // 5. Name (Optional String?) - Check only if provided
        RuleFor(x => x.UpdateKPI.Name)
            .MinimumLength(5)
            .WithMessage("KPI Name must be at least 5 characters long.")
            .MaximumLength(250)
            .WithMessage("KPI Name cannot exceed 250 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateKPI.Name));

        // 6. Description (Optional String?) - Check only if provided
        RuleFor(x => x.UpdateKPI.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateKPI.Description));

        // 7. IsOfficeMandate (Optional Bool?) - Check only if value is explicitly set (i.e., not null)
        RuleFor(x => x.UpdateKPI.IsOfficeMandate)
            .NotNull()
            .When(x => x.UpdateKPI.IsOfficeMandate.HasValue)
            .WithMessage("IsOfficeMandate must be a boolean value (true or false) if provided.");

        // 8. Status (Optional String?) - Check only if provided
        RuleFor(x => x.UpdateKPI.Status)
            .Must(status => ValidStatuses.Contains(status, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Status must be one of the following: {string.Join(", ", ValidStatuses)}.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateKPI.Status));
    }
}