using FluentValidation;

namespace ERPEZ.Application.Features.Planning.PPMPItem.Commands.UpdatePPMPItem;

public class UpdatePPMPItemCommandValidator : AbstractValidator<UpdatePPMPItemCommand>
{
    public UpdatePPMPItemCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("PPMP Item ID is required.");

        RuleFor(x => x.Name)
            .NotEmpty()
            .When(x => x.Name != null)
            .WithMessage("Item Name cannot be empty.")
            .MaximumLength(250)
            .When(x => x.Name != null)
            .WithMessage("Item Name cannot exceed 250 characters.");

        RuleFor(x => x.Unit)
            .NotEmpty()
            .When(x => x.Unit != null)
            .WithMessage("Unit cannot be empty.")
            .MaximumLength(50)
            .When(x => x.Unit != null)
            .WithMessage("Unit cannot exceed 50 characters.");

        RuleFor(x => x.UnitPrice)
            .GreaterThanOrEqualTo(0)
            .When(x => x.UnitPrice.HasValue)
            .WithMessage("Unit Price must be greater than or equal to 0.");

        RuleFor(x => x.MOPJustification)
            .NotEmpty()
            .When(x => x.MOPOverride == true)
            .WithMessage("MOP Justification is required when MOP Override is enabled.");

        RuleFor(x => x.Description)
            .MaximumLength(500)
            .When(x => !string.IsNullOrEmpty(x.Description))
            .WithMessage("Description cannot exceed 500 characters.");
    }
}
