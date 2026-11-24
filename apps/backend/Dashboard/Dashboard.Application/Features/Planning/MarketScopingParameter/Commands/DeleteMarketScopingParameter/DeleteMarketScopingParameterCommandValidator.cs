using FluentValidation;

namespace ERPEZ.Application.Features.Planning.MarketScopingParameter.Commands.DeleteMarketScopingParameter;

public class DeleteMarketScopingParameterCommandValidator : AbstractValidator<DeleteMarketScopingParameterCommand>
{
    public DeleteMarketScopingParameterCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Market scoping parameter ID is required for deletion.");
    }
}
