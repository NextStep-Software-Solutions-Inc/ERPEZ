using FluentValidation;

namespace ERPEZ.Application.Features.Planning.SupplierCategory.Commands.DeleteSupplierCategory;

public class DeleteSupplierCategoryCommandValidator : AbstractValidator<DeleteSupplierCategoryCommand>
{
    public DeleteSupplierCategoryCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Supplier category ID is required for deletion.");
    }
}
