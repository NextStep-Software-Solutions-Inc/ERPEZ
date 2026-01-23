namespace ERPEZ.Application.Features.Planning.UACSImport.Dtos;

/// <summary>
/// Represents the result of a UACS CSV import operation.
/// </summary>
public record UACSImportResultResponse
{
    /// <summary>
    /// The unique identifier for this import operation.
    /// </summary>
    public Guid ImportId { get; init; }

    /// <summary>
    /// The name of the imported CSV file.
    /// </summary>
    public string FileName { get; init; } = string.Empty;

    /// <summary>
    /// The total number of rows in the CSV file (excluding header).
    /// </summary>
    public int TotalRows { get; init; }

    /// <summary>
    /// The number of rows that were successfully imported.
    /// </summary>
    public int SuccessfulRows { get; init; }

    /// <summary>
    /// The number of rows that failed validation or import.
    /// </summary>
    public int FailedRows { get; init; }

    /// <summary>
    /// List of errors with line numbers and specific messages.
    /// </summary>
    public List<ImportError> Errors { get; init; } = [];

    /// <summary>
    /// Indicates whether this was a dry-run (validation only).
    /// </summary>
    public bool IsDryRun { get; init; }

    /// <summary>
    /// The date and time when the import was performed.
    /// </summary>
    public DateTime ImportedAt { get; init; }
}

/// <summary>
/// Represents an error that occurred during CSV import.
/// </summary>
public record ImportError
{
    /// <summary>
    /// The line number in the CSV file where the error occurred.
    /// </summary>
    public int LineNumber { get; init; }

    /// <summary>
    /// The specific error message.
    /// </summary>
    public string Message { get; init; } = string.Empty;

    /// <summary>
    /// The raw data from the CSV row that caused the error.
    /// </summary>
    public string? RawData { get; init; }
}
