using FluentValidation;

namespace ERPEZ.Application.Features.Planning.FundSource.Commands.DeleteFundSource;

public class DeleteFundSourceCommandValidator : AbstractValidator<DeleteFundSourceCommand>
{
    public DeleteFundSourceCommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Fund Source ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Fund Source ID must be a valid, non-empty GUID.");
    }
}