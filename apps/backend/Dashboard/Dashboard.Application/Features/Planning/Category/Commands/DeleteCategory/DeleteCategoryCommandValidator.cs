using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Category.Commands.DeleteCategory;

/// <summary>
/// Validator for DeleteCategoryCommand ensuring the ID is provided.
/// </summary>
public class DeleteCategoryCommandValidator : AbstractValidator<DeleteCategoryCommand>
{
    public DeleteCategoryCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Category ID is required for deletion.");
    }
}
