using FluentValidation;

namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Commands.UpdateDU;

public class UpdateDeliveryUnitCommandValidator : AbstractValidator<UpdateDeliveryUnitCommand>
{
    public UpdateDeliveryUnitCommandValidator()
    {
        // 1. Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("The Delivery Unit ID (primary key) is required for update.");

        // 2. OfficeId (Required GUID)
        RuleFor(x => x.UpdateDU.OfficeId)
            .NotEmpty()
            .WithMessage("Office ID is required and must be a valid, non-empty GUID.");

        // 3. ParentDUId (Optional GUID)
        RuleFor(x => x.UpdateDU.ParentDUId)
            .Must(id => !id.HasValue || id.Value != Guid.Empty)
            .WithMessage("If provided, the Parent Delivery Unit ID must be a valid, non-empty GUID.")
            .When(x => x.UpdateDU.ParentDUId.HasValue);

        // Optional: Ensure the ParentDUId is not the Id of the entity being updated (prevents self-parenting)
        RuleFor(x => x.UpdateDU.ParentDUId)
            .NotEqual(x => x.Id)
            .When(x => x.UpdateDU.ParentDUId.HasValue)
            .WithMessage("A Delivery Unit cannot be its own parent.");
    }
}