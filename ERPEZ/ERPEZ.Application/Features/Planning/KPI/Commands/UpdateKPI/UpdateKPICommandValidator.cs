using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.UpdateKPI;

public class UpdateKPICommandValidator : AbstractValidator<UpdateKPICommand>
{
    private readonly string[] ValidFunctionTypes =
    [
        "Core Function", "Strategic Priority", "Mandatory Support Functions"
    ];
    private readonly string[] ValidStatuses = ["Draft", "Active", "Archived"];

    public UpdateKPICommandValidator()
    {
        // 1. Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("KPI ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("KPI ID must be a valid, non-empty GUID.");

        // 2. ParentKPIId (Optional GUID)
        RuleFor(x => x.UpdateKPI.ParentKPIId)
            .Must(id => !id.HasValue || id.Value != Guid.Empty)
            .WithMessage("If provided, the Parent KPI ID must be a valid, non-empty GUID.")
            .When(x => x.UpdateKPI.ParentKPIId.HasValue);

        // 3. Self-Parenting Check
        RuleFor(x => x.UpdateKPI.ParentKPIId)
            .NotEqual(x => x.Id)
            .When(x => x.UpdateKPI.ParentKPIId.HasValue)
            .WithMessage("A KPI cannot be its own parent.");

        // 4. FunctionType (Required String, Valid Value)
        RuleFor(x => x.UpdateKPI.FunctionType)
            .NotEmpty()
            .WithMessage("Function Type is required.")
            .MaximumLength(100)
            .WithMessage("Function Type cannot exceed 100 characters.")
            .Must(type => ValidFunctionTypes.Contains(type, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Function Type must be one of the following: {string.Join(", ", ValidFunctionTypes)}.");

        // 5. Name (Required String, Min/Max Length)
        RuleFor(x => x.UpdateKPI.Name)
            .NotEmpty()
            .WithMessage("KPI Name is required.")
            .MinimumLength(5)
            .WithMessage("KPI Name must be at least 5 characters long.")
            .MaximumLength(250)
            .WithMessage("KPI Name cannot exceed 250 characters.");

        // 6. Description (Optional String, Max Length)
        RuleFor(x => x.UpdateKPI.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateKPI.Description));

        // 7. Status (Required String, Must be one of the defined valid statuses)
        RuleFor(x => x.UpdateKPI.Status)
            .NotEmpty()
            .WithMessage("Status is required.")
            .Must(status => ValidStatuses.Contains(status, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Status must be one of the following: {string.Join(", ", ValidStatuses)}.");
    }
}