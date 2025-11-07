using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPITarget.Commands.CreateKPITarget;

public class CreateKPITargetCommandValidator : AbstractValidator<CreateKPITargetCommand>
{
    private readonly string[] ValidPeriods = ["Annually", "Quarterly"];
    private readonly string[] ValidQuarters = ["FirstQuarter", "SecondQuarter", "ThirdQuarter", "FourthQuarter"];

    public CreateKPITargetCommandValidator()
    {
        // KPIId (Required GUID)
        RuleFor(x => x.KPIId)
            .NotEmpty()
            .WithMessage("KPI ID is required and must be a valid, non-empty GUID.");

        // TargetValue (Required Decimal, Non-Negative Value)
        RuleFor(x => x.TargetValue)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Target Value must be a non-negative number.");

        // Period (Required String, Valid Value)
        RuleFor(x => x.Period)
            .NotEmpty()
            .WithMessage("Period is required.")
            .Must(period => ValidPeriods.Contains(period, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Period must be one of the following: {string.Join(", ", ValidPeriods)}.");

        // QuarterName (Optional, Valid Value, Required if Period is Quarterly)
        RuleFor(x => x.QuarterName)
            .Must(quarter => ValidQuarters.Contains(quarter, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Quarter Name must be one of the following: {string.Join(", ", ValidQuarters)}.")
            // Allow QuarterName to be null or empty if the period is NOT Quarterly
            .When(x => !string.IsNullOrWhiteSpace(x.QuarterName) || !x.Period.Equals("Quarterly", StringComparison.OrdinalIgnoreCase));

        // Conditional requirement: QuarterName must be set if Period is "Quarterly"
        RuleFor(x => x.QuarterName)
            .NotEmpty()
            .WithMessage("Quarter Name is required when the Period is Quarterly.")
            .When(x => x.Period.Equals("Quarterly", StringComparison.OrdinalIgnoreCase));
    }
}