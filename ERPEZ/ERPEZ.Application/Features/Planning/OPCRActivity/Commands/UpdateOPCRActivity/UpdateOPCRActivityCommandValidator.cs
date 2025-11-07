using FluentValidation;

namespace ERPEZ.Application.Features.Planning.OPCRActivity.Commands.UpdateOPCRActivity;

public class UpdateOPCRActivityCommandValidator : AbstractValidator<UpdateOPCRActivityCommand>
{
    public UpdateOPCRActivityCommandValidator()
    {
        // 1. Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("OPCR Activity ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("OPCR Activity ID must be a valid, non-empty GUID.");

        // 2. OPCRKPIId (Required GUID)
        RuleFor(x => x.UpdateOPCRActivity.OPCRKPIId)
            .NotEmpty()
            .WithMessage("OPCR KPI ID is required and must be a valid, non-empty GUID.");

        // 3. Name (Required String, Min/Max Length)
        RuleFor(x => x.UpdateOPCRActivity.Name)
            .NotEmpty()
            .WithMessage("Activity Name is required.")
            .MinimumLength(5)
            .WithMessage("Activity Name must be at least 5 characters long.")
            .MaximumLength(250)
            .WithMessage("Activity Name cannot exceed 250 characters.");

        // 4. Description (Optional String, Max Length)
        RuleFor(x => x.UpdateOPCRActivity.Description)
            .MaximumLength(500)
            .WithMessage("Description cannot exceed 500 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateOPCRActivity.Description));

        // 5. Budget (Required Decimal, Non-Negative Value)
        RuleFor(x => x.UpdateOPCRActivity.Budget)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Budget must be a non-negative amount.");
    }
}