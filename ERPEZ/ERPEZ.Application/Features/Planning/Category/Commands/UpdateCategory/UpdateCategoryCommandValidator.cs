using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Category.Commands.UpdateCategory;

public class UpdateCategoryCommandValidator : AbstractValidator<UpdateCategoryCommand>
{
    public UpdateCategoryCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Category ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Category ID must be a valid, non-empty GUID.");

        When(x => x.UpdateCategory.Name != null, () =>
        {
            RuleFor(x => x.UpdateCategory.Name!)
                .NotEmpty()
                .WithMessage("Name is required.")
                .MaximumLength(200)
                .WithMessage("Name cannot exceed 200 characters.");
        });

        When(x => x.UpdateCategory.Code != null, () =>
        {
            RuleFor(x => x.UpdateCategory.Code!)
                .NotEmpty()
                .WithMessage("Code is required.")
                .MaximumLength(50)
                .WithMessage("Code cannot exceed 50 characters.");
        });
    }
}
