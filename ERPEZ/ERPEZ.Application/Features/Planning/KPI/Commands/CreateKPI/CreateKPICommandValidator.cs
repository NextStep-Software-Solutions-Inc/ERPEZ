using ERPEZ.Domain.Constants;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.CreateKPI;

public class CreateKPICommandValidator : AbstractValidator<CreateKPICommand>
{
    public CreateKPICommandValidator()
    {
        // ParentKPIId (Optional GUID)
        RuleFor(x => x.ParentKPIId)
            .Must(id => !id.HasValue || id.Value != Guid.Empty)
            .WithMessage("If provided, the Parent KPI ID must be a valid, non-empty GUID.")
            .When(x => x.ParentKPIId.HasValue);

        // FunctionType (Required String, Valid Value)
        RuleFor(x => x.FunctionType)
            .NotEmpty()
            .WithMessage("Function Type is required.")
            .MaximumLength(100)
            .WithMessage("Function Type cannot exceed 100 characters.")
            .Must(type => FunctionTypeConstants.validFunctionTypes.Contains(type))
            .WithMessage($"FunctionType must be one of: {string.Join(", ", FunctionTypeConstants.validFunctionTypes)}.");

        // Name (Required String, Min/Max Length)
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("KPI Name is required.")
            .MinimumLength(5)
            .WithMessage("KPI Name must be at least 5 characters long.")
            .MaximumLength(250)
            .WithMessage("KPI Name cannot exceed 250 characters.");

        // Description (Optional String, Max Length)
        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .WithMessage("Description cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));

        RuleFor(x => x.IsOfficeMandate)
            .NotNull()
            .WithMessage("Is Office Mandate must be provided (true or false).");

        RuleFor(x => x.IsPercentage)
            .NotNull()
            .WithMessage("Is Percentage must be provided (true or false).");
    }
}
