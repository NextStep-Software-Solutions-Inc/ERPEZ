using FluentValidation;

namespace ERPEZ.Application.Features.Planning.NonCSEItem.Commands.CreateNonCSEItem;

public class CreateNonCSEItemCommandValidator : AbstractValidator<CreateNonCSEItemCommand>
{
    public CreateNonCSEItemCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Item Name is required.")
            .MaximumLength(250)
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
            .WithMessage("Current Price must be greater than or equal to 0.");

        RuleFor(x => x.Remarks)
            .MaximumLength(500)
            .When(x => !string.IsNullOrEmpty(x.Remarks))
            .WithMessage("Remarks cannot exceed 500 characters.");
    }
}
