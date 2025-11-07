using FluentValidation;

namespace ERPEZ.Application.Features.Planning.Transaction.Commands.DeleteTransaction;

public class DeleteTransactionCommandValidator : AbstractValidator<DeleteTransactionCommand>
{
    public DeleteTransactionCommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Transaction ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Transaction ID must be a valid, non-empty GUID.");
    }
}