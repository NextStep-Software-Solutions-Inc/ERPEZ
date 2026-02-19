using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ItemPrice.Commands.DeleteItemPrice;

public class DeleteItemPriceCommandValidator : AbstractValidator<DeleteItemPriceCommand>
{
    public DeleteItemPriceCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Item price ID is required for deletion.");
    }
}
