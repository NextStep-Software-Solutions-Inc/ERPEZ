using FluentValidation;

namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Commands.CreateDU;

public class CreateDeliveryUnitCommandValidator : AbstractValidator<CreateDeliveryUnitCommand>
{
    public CreateDeliveryUnitCommandValidator()
    {
        // 1. OfficeId (Required GUID)
        RuleFor(x => x.OfficeId)
            .NotEmpty()
            .WithMessage("Office ID is required and must be a valid, non-empty GUID.")
            ;

        // 2. ParentDUId (Optional GUID)
        RuleFor(x => x.ParentDUId)
            .Must(id => !id.HasValue || id.Value != Guid.Empty)
            .WithMessage("If provided, the Parent Delivery Unit ID must be a valid, non-empty GUID.");
    }
}