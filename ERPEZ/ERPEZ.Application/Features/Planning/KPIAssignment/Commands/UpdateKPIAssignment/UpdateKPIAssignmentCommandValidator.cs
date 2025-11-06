using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Commands.UpdateKPIAssignment;

public class UpdateKPIAssignmentCommandValidator : AbstractValidator<UpdateKPIAssignmentCommand>
{
    public UpdateKPIAssignmentCommandValidator()
    {
        // 1. Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("KPI Assignment ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("KPI Assignment ID must be a valid, non-empty GUID.");

        // 2. KPIId (Required GUID)
        RuleFor(x => x.UpdateKPIAssignment.KPIId)
            .NotEmpty()
            .WithMessage("KPI ID is required and must be a valid, non-empty GUID.");

        // 3. DeliveryUnitId (Required GUID)
        RuleFor(x => x.UpdateKPIAssignment.DeliveryUnitId)
            .NotEmpty()
            .WithMessage("Delivery Unit ID is required and must be a valid, non-empty GUID.");
    }
}