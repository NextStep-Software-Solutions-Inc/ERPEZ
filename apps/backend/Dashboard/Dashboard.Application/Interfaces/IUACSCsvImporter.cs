using ERPEZ.Application.Features.Planning.UACSImport.Dtos;
using ERPEZ.Domain.Enums;
using Microsoft.AspNetCore.Http;

namespace ERPEZ.Application.Interfaces;

/// <summary>
/// Service interface for importing UACS data from CSV files.
/// </summary>
public interface IUACSCsvImporter
{
    /// <summary>
    /// Imports UACS data from a CSV file for a specific segment type.
    /// </summary>
    /// <param name="file">The CSV file to import.</param>
    /// <param name="segmentType">The type of UACS segment (FundSource, Organization, Location, MFOPAP, Object).</param>
    /// <param name="isDryRun">If true, validates only without importing data.</param>
    /// <param name="importedBy">The username or identifier of the user performing the import.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The import result with summary and errors.</returns>
    Task<UACSImportResultResponse> ImportAsync(
        IFormFile file,
        UACSSegmentTypeEnum segmentType,
        bool isDryRun,
        string importedBy,
        CancellationToken cancellationToken = default);
}
