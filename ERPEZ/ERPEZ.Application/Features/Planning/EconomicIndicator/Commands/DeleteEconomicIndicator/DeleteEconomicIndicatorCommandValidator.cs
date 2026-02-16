using FluentValidation;

namespace ERPEZ.Application.Features.Planning.EconomicIndicator.Commands.DeleteEconomicIndicator;

public class DeleteEconomicIndicatorCommandValidator : AbstractValidator<DeleteEconomicIndicatorCommand>
{
    public DeleteEconomicIndicatorCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Economic Indicator Id is required.");
    }
}
