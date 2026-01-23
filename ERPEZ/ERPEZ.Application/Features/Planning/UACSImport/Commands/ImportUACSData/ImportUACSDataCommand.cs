using ERPEZ.Application.Features.Planning.UACSImport.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace ERPEZ.Application.Features.Planning.UACSImport.Commands.ImportUACSData;

/// <summary>
/// Command to import UACS data from a CSV file.
/// </summary>
public class ImportUACSDataCommand : IRequest<ApiResponse<UACSImportResultResponse>>
{
    /// <summary>
    /// The CSV file to import.
    /// </summary>
    public required IFormFile File { get; init; }

    /// <summary>
    /// The type of UACS segment to import (FundSource, Organization, Location, MFOPAP, Object).
    /// </summary>
    public required UACSSegmentTypeEnum SegmentType { get; init; }

    /// <summary>
    /// If true, validates only without importing data (dry-run mode).
    /// </summary>
    public bool IsDryRun { get; init; }

    /// <summary>
    /// The username or identifier of the user performing the import.
    /// </summary>
    public required string ImportedBy { get; init; }
}
