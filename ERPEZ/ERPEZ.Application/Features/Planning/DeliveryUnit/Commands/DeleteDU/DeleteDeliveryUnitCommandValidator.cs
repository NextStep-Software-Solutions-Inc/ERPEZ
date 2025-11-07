using FluentValidation;

namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Commands.DeleteDU;

public class DeleteDeliveryUnitCommandValidator : AbstractValidator<DeleteDeliveryUnitCommand>
{
    public DeleteDeliveryUnitCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Delivery Unit ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Delivery Unit ID must be a valid, non-empty GUID.");
    }
}
