using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Exceptions;

namespace ERPEZ.Application.Features.Planning.OPCRItem.Validators;

public class OPCRItemTargetValidator : IOPCRItemTargetValidator
{
    public void Validate(
        string kpiName,
        DistributionBehaviorEnum distributionBehavior,
        bool isLocked,
        bool isShopped,
        decimal assignedAnnualTarget,
        decimal? assignedQ1,
        decimal? assignedQ2,
        decimal? assignedQ3,
        decimal? assignedQ4,
        decimal q1,   // ← was int
        decimal q2,   // ← was int
        decimal q3,   // ← was int
        decimal q4)   // ← was int
    {
        if (q1 < 0 || q2 < 0 || q3 < 0 || q4 < 0)
        {
            throw new ValidationException("Quarterly targets cannot be negative.");
        }

        var proposedAnnualTarget   = q1 + q2 + q3 + q4;
        var assignedQuarterSummary = $"Assigned quarters: Q1={FormatQuarter(assignedQ1)}, Q2={FormatQuarter(assignedQ2)}, Q3={FormatQuarter(assignedQ3)}, Q4={FormatQuarter(assignedQ4)}";
        var submittedQuarterSummary = $"Submitted quarters: Q1={q1}, Q2={q2}, Q3={q3}, Q4={q4}, Annual={proposedAnnualTarget}";

        if (isLocked)
        {
            if (Math.Abs(proposedAnnualTarget - assignedAnnualTarget) > 0.0001m)
            {
                throw new ValidationException(
                    $"KPI '{kpiName}' is locked. Sum of submitted quarterly targets must exactly match the assigned annual target. " +
                    $"Assigned annual target: {assignedAnnualTarget}. {submittedQuarterSummary}. {assignedQuarterSummary}.");
            }

            ValidateLockedQuarterlyAlignment(kpiName, assignedQ1, assignedQ2, assignedQ3, assignedQ4, q1, q2, q3, q4, submittedQuarterSummary);
        }

        switch (distributionBehavior)
        {
            case DistributionBehaviorEnum.Summation:
                ValidateSummation(kpiName, isLocked, assignedAnnualTarget, proposedAnnualTarget);
                break;

            case DistributionBehaviorEnum.Uniform:
                ValidateUniform(kpiName, q1, q2, q3, q4);
                break;

            case DistributionBehaviorEnum.Maximum:
                ValidateMaximum(kpiName, assignedAnnualTarget, proposedAnnualTarget);
                break;

            case DistributionBehaviorEnum.Minimum:
                ValidateMinimum(kpiName, assignedAnnualTarget, proposedAnnualTarget);
                break;

            case DistributionBehaviorEnum.Milestone:
                ValidateMilestone(kpiName, q1, q2, q3, q4, isShopped);
                break;
        }
    }

    private static void ValidateSummation(
        string kpiName, bool isLocked,
        decimal assignedAnnualTarget, decimal proposedAnnualTarget)  // ← was int
    {
        if (isLocked && Math.Abs(proposedAnnualTarget - assignedAnnualTarget) > 0.0001m)
        {
            throw new ValidationException(
                $"KPI '{kpiName}' has Divisible/Summation behavior and is locked. " +
                $"Sum of quarterly targets ({proposedAnnualTarget}) must equal the assigned annual target ({assignedAnnualTarget}).");
        }

        if (proposedAnnualTarget > assignedAnnualTarget)
        {
            throw new ValidationException(
                $"KPI '{kpiName}' has Divisible/Summation behavior. " +
                $"Proposed annual target ({proposedAnnualTarget}) cannot exceed assigned annual target ({assignedAnnualTarget}).");
        }
    }

    private static void ValidateUniform(
        string kpiName,
        decimal q1, decimal q2, decimal q3, decimal q4)  // ← was int
    {
        var selected = new[] { q1, q2, q3, q4 }.Where(q => q > 0).ToList();
        if (selected.Count <= 1) return;

        var baseline = selected[0];
        if (selected.Any(q => q != baseline))
        {
            throw new ValidationException(
                $"KPI '{kpiName}' has Uniform behavior. All non-zero quarterly targets must be equal. " +
                $"Submitted values: Q1={q1}, Q2={q2}, Q3={q3}, Q4={q4}.");
        }
    }

    private static void ValidateMaximum(
        string kpiName,
        decimal assignedAnnualTarget, decimal proposedAnnualTarget)  // ← was int
    {
        if (proposedAnnualTarget > assignedAnnualTarget)
        {
            throw new ValidationException(
                $"KPI '{kpiName}' has Maximum behavior. " +
                $"Proposed annual target ({proposedAnnualTarget}) cannot exceed assigned annual target ({assignedAnnualTarget}).");
        }
    }

    private static void ValidateMinimum(
        string kpiName,
        decimal assignedAnnualTarget, decimal proposedAnnualTarget)  // ← was int
    {
        if (proposedAnnualTarget < assignedAnnualTarget)
        {
            throw new ValidationException(
                $"KPI '{kpiName}' has Minimum behavior. " +
                $"Proposed annual target ({proposedAnnualTarget}) cannot be below assigned annual target ({assignedAnnualTarget}).");
        }
    }

    private static void ValidateMilestone(
        string kpiName,
        decimal q1, decimal q2, decimal q3, decimal q4,  // ← was int
        bool isShopped)
    {
        if (isShopped) return;

        if (q1 == 0 && q2 == 0 && q3 == 0 && q4 == 0)
        {
            throw new ValidationException(
                $"KPI '{kpiName}' has Milestone behavior. At least one quarter should have a target.");
        }
    }

    private static void ValidateLockedQuarterlyAlignment(
        string kpiName,
        decimal? assignedQ1, decimal? assignedQ2,
        decimal? assignedQ3, decimal? assignedQ4,
        decimal q1, decimal q2, decimal q3, decimal q4,  // ← was int
        string submittedQuarterSummary)
    {
        ValidateQuarter(kpiName, "Q1", assignedQ1, q1, submittedQuarterSummary);
        ValidateQuarter(kpiName, "Q2", assignedQ2, q2, submittedQuarterSummary);
        ValidateQuarter(kpiName, "Q3", assignedQ3, q3, submittedQuarterSummary);
        ValidateQuarter(kpiName, "Q4", assignedQ4, q4, submittedQuarterSummary);
    }

    private static void ValidateQuarter(
        string kpiName, string quarterName,
        decimal? assignedQuarter, decimal submittedQuarter,  // ← was int
        string submittedQuarterSummary)
    {
        if (!assignedQuarter.HasValue) return;

        if (Math.Abs(assignedQuarter.Value - submittedQuarter) > 0.0001m)
        {
            throw new ValidationException(
                $"KPI '{kpiName}' is locked. {quarterName} target must match the assigned {quarterName} target ({assignedQuarter.Value}). " +
                $"Submitted {quarterName}: {submittedQuarter}. {submittedQuarterSummary}.");
        }
    }

    private static string FormatQuarter(decimal? value) =>
        value.HasValue ? value.Value.ToString("0.##") : "null";
}