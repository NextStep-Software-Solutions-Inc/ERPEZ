using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ProcurementItem.Commands.CreateProcurementItem;

public class CreateProcurementItemCommandValidator : AbstractValidator<CreateProcurementItemCommand>
{
    public CreateProcurementItemCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Name is required.")
            .MaximumLength(250)
            .WithMessage("Name cannot exceed 250 characters.");

        RuleFor(x => x.Specifications)
            .MaximumLength(2000)
            .WithMessage("Specifications cannot exceed 2000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Specifications));

        RuleFor(x => x.Type)
            .NotEmpty()
            .WithMessage("Type is required.")
            .Must(BeValidProcurementItemType)
            .WithMessage("Type must be one of: Expendable, SemiExpendable, Equipment, PPE.");

        RuleFor(x => x.ItemLife)
            .GreaterThan(0)
            .WithMessage("Item life must be greater than 0.")
            .When(x => x.ItemLife.HasValue);

        RuleFor(x => x.ProductCode)
            .MaximumLength(100)
            .WithMessage("Product code cannot exceed 100 characters.")
            .When(x => !string.IsNullOrEmpty(x.ProductCode));

        RuleFor(x => x.ObjectCodeId)
            .NotEmpty()
            .WithMessage("Object code is required.");

        RuleFor(x => x.UOMId)
            .NotEmpty()
            .WithMessage("Unit of measure is required.");
    }

    private bool BeValidProcurementItemType(string type)
    {
        if (string.IsNullOrEmpty(type))
            return false;

        return Enum.TryParse<ProcurementItemTypeEnum>(type, true, out _);
    }
}
