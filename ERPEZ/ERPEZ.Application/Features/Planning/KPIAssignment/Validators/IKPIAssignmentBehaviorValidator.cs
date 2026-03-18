using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Planning.KPIAssignment.Validators;

/// <summary>
/// Service interface for validating KPI assignment target distribution behaviors.
/// Provides validation methods for Summation, Uniform, Maximum, Minimum, and Milestone behaviors.
/// </summary>
public interface IKPIAssignmentBehaviorValidator
{
    /// <summary>
    /// Validates Summation behavior: cumulative assigned targets must not exceed agency annual target.
    /// </summary>
    void ValidateSummation(string kpiName, decimal agencyAnnualTarget, decimal cumulativeTotalAssigned, decimal existingTotal, decimal newAssignedTotal);

    /// <summary>
    /// Validates Uniform behavior: assigned target must equal agency annual target.
    /// Also validates that each quarterly target equals the assigned annual target.
    /// </summary>
    void ValidateUniform(string kpiName, decimal agencyAnnualTarget, decimal assignedAnnualTarget);

    /// <summary>
    /// Validates quarterly targets for Uniform behavior: each provided quarterly must equal the assigned annual target.
    /// </summary>
    void ValidateUniformQuarterly(string kpiName, decimal assignedAnnualTarget, decimal? q1, decimal? q2, decimal? q3, decimal? q4);

    /// <summary>
    /// Validates Maximum behavior: assigned target must not exceed agency annual target.
    /// </summary>
    void ValidateMaximum(string kpiName, decimal agencyAnnualTarget, decimal assignedTarget);

    /// <summary>
    /// Validates Minimum behavior: assigned target must not be below agency annual target.
    /// </summary>
    void ValidateMinimum(string kpiName, decimal agencyAnnualTarget, decimal assignedTarget);

    /// <summary>
    /// Validates percentage-type measurements: targets cannot exceed 100%.
    /// </summary>
    void ValidatePercentageMeasurement(string kpiName, decimal assignedAnnualTarget, decimal? q1, decimal? q2, decimal? q3, decimal? q4);
}
