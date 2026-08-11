using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Category.Commands.CreateCategory;

public class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
{
    public CreateCategoryCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Category Name is required.")
            .MaximumLength(200)
            .WithMessage("Name cannot exceed 200 characters.");

        RuleFor(x => x.Code)
            .NotEmpty()
            .WithMessage("Category Code is required.")
            .MaximumLength(50)
            .WithMessage("Code cannot exceed 50 characters.");
    }
}
