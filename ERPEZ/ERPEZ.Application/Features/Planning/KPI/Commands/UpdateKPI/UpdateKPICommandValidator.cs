using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.UpdateKPI;

public class UpdateKPICommandValidator : AbstractValidator<UpdateKPICommand>
{
    private readonly string[] validStatuses = Enum.GetNames<StatusEnum>();
    private readonly string[] validFunctionTypes = Enum.GetNames<FunctionTypeEnum>();

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
                .Must(type => validFunctionTypes.Contains(type))
                .WithMessage($"FunctionType must be one of: {string.Join(", ", validFunctionTypes)}.")
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

        RuleFor(x => x.UpdateKPI.Status)
            .Must(status => validStatuses.Contains(status, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Status must be one of the following: {string.Join(", ", validStatuses)}.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateKPI.Status));

        RuleFor(x => x.UpdateKPI.IsOfficeMandate)
            .NotNull()
            .WithMessage("Is Office Mandate must be provided (true or false).");

        RuleFor(x => x.UpdateKPI.IsPercentage)
            .NotNull()
            .WithMessage("Is Percentage must be provided (true or false).");
    }
}
