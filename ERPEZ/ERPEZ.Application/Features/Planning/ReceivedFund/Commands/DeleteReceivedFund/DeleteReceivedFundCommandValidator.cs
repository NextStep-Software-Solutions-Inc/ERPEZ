using FluentValidation;

namespace ERPEZ.Application.Features.Planning.ReceivedFund.Commands.DeleteReceivedFund;

public class DeleteReceivedFundCommandValidator : AbstractValidator<DeleteReceivedFundCommand>
{
    public DeleteReceivedFundCommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Received Fund ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Received Fund ID must be a valid, non-empty GUID.");
    }
}
