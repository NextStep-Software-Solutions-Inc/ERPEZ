using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ProcurementItem.Commands.UpdateProcurementItem;

public class UpdateProcurementItemCommandValidator : AbstractValidator<UpdateProcurementItemCommand>
{
    public UpdateProcurementItemCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Id is required.");

        RuleFor(x => x.Name)
            .MaximumLength(250)
            .WithMessage("Name cannot exceed 250 characters.")
            .When(x => !string.IsNullOrEmpty(x.Name));

        RuleFor(x => x.Specifications)
            .MaximumLength(2000)
            .WithMessage("Specifications cannot exceed 2000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Specifications));

        RuleFor(x => x.Type)
            .Must(BeValidProcurementItemType)
            .WithMessage("Type must be one of: Expendable, SemiExpandable, Equipment, PPE.")
            .When(x => !string.IsNullOrEmpty(x.Type));

        RuleFor(x => x.ItemLife)
            .GreaterThan(0)
            .WithMessage("Item life must be greater than 0.")
            .When(x => x.ItemLife.HasValue);

        RuleFor(x => x.ProductCode)
            .MaximumLength(100)
            .WithMessage("Product code cannot exceed 100 characters.")
            .When(x => !string.IsNullOrEmpty(x.ProductCode));
    }

    private bool BeValidProcurementItemType(string? type)
    {
        if (string.IsNullOrEmpty(type))
            return false;

        return Enum.TryParse<ProcurementItemTypeEnum>(type, true, out _);
    }
}
