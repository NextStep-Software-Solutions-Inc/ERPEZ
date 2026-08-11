using Microsoft.AspNetCore.Http;

namespace ERPEZ.Api.Models;

/// <summary>
/// Form model for UACS data import with file upload.
/// </summary>
public class UACSImportFormModel
{
    /// <summary>
    /// The CSV or Excel file to import.
    /// </summary>
    public IFormFile File { get; set; } = null!;

    /// <summary>
    /// The type of UACS segment (FundSource, Organization, Location, MFOPAP, Object).
    /// </summary>
    public string SegmentType { get; set; } = string.Empty;

    /// <summary>
    /// If true, validates only without importing data.
    /// </summary>
    public bool IsDryRun { get; set; }

    /// <summary>
    /// The username of the user performing the import.
    /// </summary>
    public string ImportedBy { get; set; } = string.Empty;
}
