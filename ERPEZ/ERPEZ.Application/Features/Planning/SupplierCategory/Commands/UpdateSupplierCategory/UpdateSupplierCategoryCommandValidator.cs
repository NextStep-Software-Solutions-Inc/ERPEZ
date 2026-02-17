using FluentValidation;

namespace ERPEZ.Application.Features.Planning.SupplierCategory.Commands.UpdateSupplierCategory;

public class UpdateSupplierCategoryCommandValidator : AbstractValidator<UpdateSupplierCategoryCommand>
{
    public UpdateSupplierCategoryCommandValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Supplier Category Name is required.")
            .MaximumLength(250)
            .WithMessage("Supplier Category Name cannot exceed 250 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(500)
            .WithMessage("Description cannot exceed 500 characters.")
            .When(x => !string.IsNullOrEmpty(x.Description));
    }
}
