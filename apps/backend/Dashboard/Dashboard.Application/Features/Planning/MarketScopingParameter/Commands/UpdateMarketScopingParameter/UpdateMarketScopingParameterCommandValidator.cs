using FluentValidation;

namespace ERPEZ.Application.Features.Planning.MarketScopingParameter.Commands.UpdateMarketScopingParameter;

public class UpdateMarketScopingParameterCommandValidator : AbstractValidator<UpdateMarketScopingParameterCommand>
{
    public UpdateMarketScopingParameterCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Parameter ID is required.");

        RuleFor(x => x.UpdateData.Remarks)
            .MaximumLength(1000)
            .WithMessage("Remarks cannot exceed 1000 characters.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateData.Remarks));
    }
}
