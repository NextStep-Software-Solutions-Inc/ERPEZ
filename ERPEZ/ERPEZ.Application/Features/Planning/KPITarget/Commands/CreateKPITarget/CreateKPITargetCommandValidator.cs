using ERPEZ.Domain.Enums;
using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPITarget.Commands.CreateKPITarget;

public class CreateKPITargetCommandValidator : AbstractValidator<CreateKPITargetCommand>
{
    private readonly string[] validPeriods = Enum.GetNames<PeriodEnum>();
    private readonly string[] validQuarters = Enum.GetNames<QuarterEnum>();

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
            .Must(period => validPeriods.Contains(period, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Period must be one of the following: {string.Join(", ", validPeriods)}.");

        // QuarterName (Optional, Valid Value, Required if Period is Quarterly)
        RuleFor(x => x.QuarterName)
            .Must(quarter => validQuarters.Contains(quarter, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Quarter Name must be one of the following: {string.Join(", ", validQuarters)}.")
            .When(x => !string.IsNullOrWhiteSpace(x.QuarterName) || !x.Period.Equals(PeriodEnum.Quarterly.ToString(), StringComparison.OrdinalIgnoreCase));

        // Conditional requirement: QuarterName must be set if Period is "Quarterly"
        RuleFor(x => x.QuarterName)
            .NotEmpty()
            .WithMessage("Quarter Name is required when the Period is Quarterly.")
            .When(x => x.Period.Equals(PeriodEnum.Quarterly.ToString(), StringComparison.OrdinalIgnoreCase));
    }
}
