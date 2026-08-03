using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.ItemCategories.Commands.DeleteItemCategory;

public class DeleteItemCategoryCommandValidator : AbstractValidator<DeleteItemCategoryCommand>
{
    public DeleteItemCategoryCommandValidator()
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.");
    }
}
