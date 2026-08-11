using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents a log entry for UACS data imports from CSV files.
/// Tracks import statistics, errors, and metadata for auditing purposes.
/// </summary>
public class UACSImportLog : BaseEntity
{
    /// <summary>
    /// The unique identifier for this import operation.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid ImportId { get; set; }

    /// <summary>
    /// The name of the imported CSV file.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string FileName { get; set; } = string.Empty;

    /// <summary>
    /// The total number of rows in the CSV file (excluding header).
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public int TotalRows { get; set; }

    /// <summary>
    /// The number of rows that were successfully imported.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public int SuccessfulRows { get; set; }

    /// <summary>
    /// The number of rows that failed validation or import.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public int FailedRows { get; set; }

    /// <summary>
    /// JSON-formatted error log containing line numbers and specific error messages.
    /// </summary>
    public string ErrorLog { get; set; } = string.Empty;

    /// <summary>
    /// The username or identifier of the user who performed the import.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public string ImportedBy { get; set; } = string.Empty;

    /// <summary>
    /// The date and time when the import was performed.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public DateTime ImportedAt { get; set; }
}
