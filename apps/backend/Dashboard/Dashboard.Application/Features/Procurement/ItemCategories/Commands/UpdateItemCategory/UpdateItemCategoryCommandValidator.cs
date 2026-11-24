using FluentValidation;

namespace ERPEZ.Application.Features.Procurement.ItemCategories.Commands.UpdateItemCategory;

public class UpdateItemCategoryCommandValidator : AbstractValidator<UpdateItemCategoryCommand>
{
    public UpdateItemCategoryCommandValidator()
    {
        RuleFor(v => v.Id)
            .NotEmpty().WithMessage("Id is required.");

        RuleFor(v => v.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(200).WithMessage("Name must not exceed 200 characters.");
    }
}
