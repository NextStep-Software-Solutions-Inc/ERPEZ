using System.Text.Json.Serialization;

namespace ERPEZ.Domain.Enums;

/// <summary>
/// Determines which UI tab and source the PR was created from.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum PRType
{
    /// <summary>
    /// Tab 1 in the PR Management UI.
    /// Items are Non-CSE lines from approved Office PPMPs.
    /// PPMPItem.CSEItemId IS NULL for these lines.
    /// </summary>
    NonCSE,

    /// <summary>
    /// Tab 2 in the PR Management UI.
    /// Items are CSE lines flagged as out-of-stock at DBM-PS,
    /// sourced from an approved APR.
    /// </summary>
    OutOfStockCSE
}