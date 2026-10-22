using FluentValidation;

namespace ERPEZ.Application.Features.Planning.EconomicIndicator.Commands.UpdateEconomicIndicator;

public class UpdateEconomicIndicatorRequestValidator : AbstractValidator<UpdateEconomicIndicatorRequest>
{
    public UpdateEconomicIndicatorRequestValidator()
    {
        RuleFor(x => x.VATRate)
            .GreaterThanOrEqualTo(0)
            .WithMessage("VAT Rate must be greater than or equal to 0.")
            .LessThanOrEqualTo(100)
            .WithMessage("VAT Rate cannot exceed 100.");

        RuleFor(x => x.InflationRate)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Inflation Rate must be greater than or equal to 0.")
            .LessThanOrEqualTo(100)
            .WithMessage("Inflation Rate cannot exceed 100.");

        RuleFor(x => x.IncomeTaxRate)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Income Tax Rate must be greater than or equal to 0.")
            .LessThanOrEqualTo(100)
            .WithMessage("Income Tax Rate cannot exceed 100.");
    }
}
