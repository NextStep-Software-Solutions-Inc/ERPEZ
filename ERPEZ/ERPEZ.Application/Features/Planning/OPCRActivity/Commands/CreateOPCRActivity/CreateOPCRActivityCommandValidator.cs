using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Commands.CreateOPCRActivity;

public class CreateOPCRActivityCommandValidator : AbstractValidator<CreateOPCRActivityCommand>
{
    public CreateOPCRActivityCommandValidator()
    {
        // OPCRKPIId (Required GUID)
        RuleFor(x => x.OPCRKPIId)
            .NotEmpty()
            .WithMessage("OPCR KPI ID is required and must be a valid, non-empty GUID.");

        // Name (Required String, Min/Max Length)
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Activity Name is required.")
            .MinimumLength(5)
            .WithMessage("Activity Name must be at least 5 characters long.")
            .MaximumLength(250)
            .WithMessage("Activity Name cannot exceed 250 characters.");

        // Description (Optional String, Max Length)
        RuleFor(x => x.Description)
            .MaximumLength(500)
            .WithMessage("Description cannot exceed 500 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.Description));

        // Budget (Required Decimal, Non-Negative Value)
        RuleFor(x => x.Budget)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Budget must be a non-negative amount.");
    }
}