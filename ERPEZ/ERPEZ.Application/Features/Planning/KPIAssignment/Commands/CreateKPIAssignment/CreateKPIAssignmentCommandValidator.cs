using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Commands.CreateKPIAssignment;

public class CreateKPIAssignmentCommandValidator : AbstractValidator<CreateKPIAssignmentCommand>
{
    public CreateKPIAssignmentCommandValidator()
    {
        // KPIId (Required GUID)
        RuleFor(x => x.KPIId)
            .NotEmpty()
            .WithMessage("KPI ID is required and must be a valid, non-empty GUID.");

        // DeliveryUnitId (Required GUID)
        RuleFor(x => x.DeliveryUnitId)
            .NotEmpty()
            .WithMessage("Delivery Unit ID is required and must be a valid, non-empty GUID.");
    }
}