using FluentValidation;

namespace ERPEZ.Application.Features.Planning.KPITarget.Commands.UpdateKPITarget;

public class UpdateKPITargetCommandValidator : AbstractValidator<UpdateKPITargetCommand>
{
    private readonly string[] validPeriods = ["Annually", "Quarterly"];
    private readonly string[] validQuarters = ["FirstQuarter", "SecondQuarter", "ThirdQuarter", "FourthQuarter"];

    public UpdateKPITargetCommandValidator()
    {
        // 1. Primary ID Validation (Crucial for updates)
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("KPI Target ID is required for update.")
            .Must(id => id != Guid.Empty)
            .WithMessage("KPI Target ID must be a valid, non-empty GUID.");

        // 3. TargetValue (Required Decimal, Non-Negative Value)
        RuleFor(x => x.UpdateKPITarget.TargetValue)
            .GreaterThanOrEqualTo(0)
            .WithMessage("Target Value must be a non-negative number.");

        // 4. Period (Required String, Valid Value)
        RuleFor(x => x.UpdateKPITarget.Period)
            .NotEmpty()
            .WithMessage("Period is required.")
            .Must(period => validPeriods.Contains(period, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Period must be one of the following: {string.Join(", ", validPeriods)}.");

        // 5. QuarterName (Optional, Valid Value, Required if Period is Quarterly)
        RuleFor(x => x.UpdateKPITarget.QuarterName)
            .Must(quarterName =>
                quarterName == null ||
                validQuarters.Contains(quarterName, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Quarter Name must be one of the following: {string.Join(", ", validQuarters)}.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateKPITarget.QuarterName));

        // 6. Conditional Requirement: QuarterName must be set if Period is "Quarterly"
        RuleFor(x => x.UpdateKPITarget.QuarterName)
            .NotEmpty()
            .WithMessage("Quarter Name is required when the Period is Quarterly.")
            .When(x => !string.IsNullOrWhiteSpace(x.UpdateKPITarget.Period) &&
                       x.UpdateKPITarget.Period.Equals("Quarterly", StringComparison.OrdinalIgnoreCase));
    }
}
