using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Supplier.Commands.DeleteSupplier;

public class DeleteSupplierCommandValidator : AbstractValidator<DeleteSupplierCommand>
{
    public DeleteSupplierCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Supplier ID is required for deletion.");
    }
}
