using FluentValidation;

namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Commands.CreateDU;

public class CreateDeliveryUnitCommandValidator : AbstractValidator<CreateDeliveryUnitCommand>
{
    public CreateDeliveryUnitCommandValidator()
    {
        // 1. OfficeId (Required GUID)
        RuleFor(x => x.OfficeId)
            .NotEmpty()
            .WithMessage("Office ID is required and must be a valid, non-empty GUID.");
        // 2. ParentId (Optional GUID)
        RuleFor(x => x.ParentId)
            .Must(id => !id.HasValue || id.Value != Guid.Empty)
            .WithMessage("If provided, the Parent Delivery Unit ID must be a valid, non-empty GUID.");
            // Note: When a DeliveryUnit has a parent, the parent DeliveryUnit must have this child listed in its SubDeliveryUnits collection.
            // This relationship is enforced in the command handler.
    }
}
