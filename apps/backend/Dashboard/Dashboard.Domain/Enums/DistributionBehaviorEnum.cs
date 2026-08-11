namespace ERPEZ.Domain.Enums;

/// <summary>
/// Defines how KPI targets are distributed from Agency level (Level 1) to Office level (Level 2).
/// This is independent of MeasurementUnit (Number, Percentage, Currency).
/// </summary>
public enum DistributionBehaviorEnum
{
    /// <summary>
    /// Sum of all office targets must equal agency target.
    /// Example: Agency: 100%, Office A: 30%, Office B: 40%, Office C: 30%
    /// Example: Agency: 1000 units, Office A: 400, Office B: 350, Office C: 250
    /// </summary>
    Summation,

    /// <summary>
    /// Alias for Summation retained for compatibility with persisted/API values.
    /// </summary>
    Divisible = Summation,

    /// <summary>
    /// Each office receives the exact same target as the agency target.
    /// Example: Agency: 80%, all offices get 80% each
    /// Example: Agency: 50 units, all offices get 50 units each
    /// Used for qualitative KPIs like "Customer Satisfaction Rate"
    /// </summary>
    Uniform,

    /// <summary>
    /// No office target should exceed the agency target.
    /// Useful for ceiling-based controls where each office has an upper bound.
    /// </summary>
    Maximum,

    /// <summary>
    /// No office target should fall below the agency target.
    /// Useful for floor-based controls where each office must meet a minimum threshold.
    /// </summary>
    Minimum,

    /// <summary>
    /// Event-based or binary KPIs with flexible target assignment.
    /// Example: "System Go-Live Date", "Certification Achieved"
    /// No strict mathematical validation - targets can vary by office
    /// </summary>
    Milestone
}
