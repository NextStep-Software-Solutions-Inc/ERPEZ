using FluentValidation;

namespace ERPEZ.Application.Features.Planning.NonCSEItem.Commands.UpdateNonCSEItem;

public class UpdateNonCSEItemCommandValidator : AbstractValidator<UpdateNonCSEItemCommand>
{
    public UpdateNonCSEItemCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Non-CSE Item ID is required.");

        RuleFor(x => x.Name)
            .NotEmpty()
            .When(x => x.Name != null)
            .WithMessage("Item Name cannot be empty.")
            .MaximumLength(250)
            .When(x => x.Name != null)
            .WithMessage("Item Name cannot exceed 250 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(1000)
            .When(x => !string.IsNullOrEmpty(x.Description))
            .WithMessage("Description cannot exceed 1000 characters.");

        RuleFor(x => x.ProductCode)
            .MaximumLength(100)
            .When(x => !string.IsNullOrEmpty(x.ProductCode))
            .WithMessage("Product Code cannot exceed 100 characters.");

        RuleFor(x => x.CurrentPrice)
            .GreaterThanOrEqualTo(0)
            .When(x => x.CurrentPrice.HasValue)
            .WithMessage("Current Price must be greater than or equal to 0.");

        RuleFor(x => x.Remarks)
            .MaximumLength(500)
            .When(x => !string.IsNullOrEmpty(x.Remarks))
            .WithMessage("Remarks cannot exceed 500 characters.");
    }
}
