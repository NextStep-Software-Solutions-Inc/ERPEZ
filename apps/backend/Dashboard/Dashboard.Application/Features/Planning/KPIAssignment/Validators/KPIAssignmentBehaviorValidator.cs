using ERPEZ.Shared.Exceptions;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Validators;

/// <summary>
/// Implements validation for KPI assignment target distribution behaviors.
/// Enforces mathematical rules for Summation, Uniform, Maximum, Minimum, and Milestone behaviors.
/// </summary>
public class KPIAssignmentBehaviorValidator : IKPIAssignmentBehaviorValidator
{
    /// <summary>
    /// Validates Summation behavior: cumulative assigned targets must not exceed agency annual target.
    /// </summary>
    public void ValidateSummation(string kpiName, decimal agencyAnnualTarget, decimal cumulativeTotalAssigned, decimal existingTotal, decimal newAssignedTotal)
    {
        if (cumulativeTotalAssigned > agencyAnnualTarget)
        {
            var remainingTarget = agencyAnnualTarget - existingTotal;
            throw new ValidationException(
                $"KPI '{kpiName}' has Summation behavior. " +
                $"Total assigned ({cumulativeTotalAssigned:F2}) would exceed agency annual target ({agencyAnnualTarget:F2}). " +
                $"Already assigned: {existingTotal:F2}, Attempting to assign: {newAssignedTotal:F2}. " +
                $"Maximum remaining: {remainingTarget:F2}.");
        }
    }

    /// <summary>
    /// Validates Uniform behavior: assigned target must equal agency annual target.
    /// </summary>
    public void ValidateUniform(string kpiName, decimal agencyAnnualTarget, decimal assignedAnnualTarget)
    {
        if (Math.Abs(assignedAnnualTarget - agencyAnnualTarget) > 0.01m)
        {
            throw new ValidationException(
                $"KPI '{kpiName}' has Uniform behavior. " +
                $"Each office must receive the exact agency annual target ({agencyAnnualTarget}). " +
                $"Attempting to assign: {assignedAnnualTarget}.");
        }
    }

    /// <summary>
    /// Validates quarterly targets for Uniform behavior: each provided quarterly must equal the assigned annual target.
    /// </summary>
    public void ValidateUniformQuarterly(string kpiName, decimal assignedAnnualTarget, decimal? q1, decimal? q2, decimal? q3, decimal? q4)
    {
        if (q1.HasValue && Math.Abs(q1.Value - assignedAnnualTarget) > 0.01m)
            throw new ValidationException($"For Uniform behavior in KPI '{kpiName}', Q1 target must equal assigned annual target ({assignedAnnualTarget}).");

        if (q2.HasValue && Math.Abs(q2.Value - assignedAnnualTarget) > 0.01m)
            throw new ValidationException($"For Uniform behavior in KPI '{kpiName}', Q2 target must equal assigned annual target ({assignedAnnualTarget}).");

        if (q3.HasValue && Math.Abs(q3.Value - assignedAnnualTarget) > 0.01m)
            throw new ValidationException($"For Uniform behavior in KPI '{kpiName}', Q3 target must equal assigned annual target ({assignedAnnualTarget}).");

        if (q4.HasValue && Math.Abs(q4.Value - assignedAnnualTarget) > 0.01m)
            throw new ValidationException($"For Uniform behavior in KPI '{kpiName}', Q4 target must equal assigned annual target ({assignedAnnualTarget}).");
    }

    /// <summary>
    /// Validates Maximum behavior: assigned target must not exceed agency annual target.
    /// </summary>
    public void ValidateMaximum(string kpiName, decimal agencyAnnualTarget, decimal assignedTarget)
    {
        if (assignedTarget > agencyAnnualTarget)
        {
            throw new ValidationException(
                $"KPI '{kpiName}' has Maximum behavior. " +
                $"No office target may exceed the agency annual target ({agencyAnnualTarget}). " +
                $"Attempting to assign: {assignedTarget}.");
        }
    }

    /// <summary>
    /// Validates Minimum behavior: assigned target must not be below agency annual target.
    /// </summary>
    public void ValidateMinimum(string kpiName, decimal agencyAnnualTarget, decimal assignedTarget)
    {
        if (assignedTarget < agencyAnnualTarget)
        {
            throw new ValidationException(
                $"KPI '{kpiName}' has Minimum behavior. " +
                $"No office target may be below the agency annual target ({agencyAnnualTarget}). " +
                $"Attempting to assign: {assignedTarget}.");
        }
    }

    /// <summary>
    /// Validates percentage-type measurements: targets cannot exceed 100%.
    /// </summary>
    public void ValidatePercentageMeasurement(string kpiName, decimal assignedAnnualTarget, decimal? q1, decimal? q2, decimal? q3, decimal? q4)
    {
        if (assignedAnnualTarget > 100)
        {
            throw new ValidationException(
                $"KPI '{kpiName}' measures Percentage. " +
                $"Assigned target ({assignedAnnualTarget}%) cannot exceed 100%.");
        }

        if (q1.HasValue && q1.Value > 100)
            throw new ValidationException("Q1 percentage target cannot exceed 100%.");

        if (q2.HasValue && q2.Value > 100)
            throw new ValidationException("Q2 percentage target cannot exceed 100%.");

        if (q3.HasValue && q3.Value > 100)
            throw new ValidationException("Q3 percentage target cannot exceed 100%.");

        if (q4.HasValue && q4.Value > 100)
            throw new ValidationException("Q4 percentage target cannot exceed 100%.");
    }
}
