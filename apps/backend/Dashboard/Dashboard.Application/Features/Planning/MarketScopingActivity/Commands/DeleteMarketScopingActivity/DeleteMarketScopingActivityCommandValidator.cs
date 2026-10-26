using FluentValidation;

namespace ERPEZ.Application.Features.Planning.MarketScopingActivity.Commands.DeleteMarketScopingActivity;

public class DeleteMarketScopingActivityCommandValidator : AbstractValidator<DeleteMarketScopingActivityCommand>
{
    public DeleteMarketScopingActivityCommandValidator()
    {
        // Primary ID Validation (Required for deletion)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Market Scoping Activity ID is required for deletion.")
            .Must(id => id != Guid.Empty)
            .WithMessage("Market Scoping Activity ID must be a valid, non-empty GUID.");
    }
}
