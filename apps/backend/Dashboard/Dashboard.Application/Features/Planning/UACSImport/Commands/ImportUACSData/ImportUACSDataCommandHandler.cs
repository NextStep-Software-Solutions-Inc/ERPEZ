using ERPEZ.Application.Features.Planning.UACSImport.Dtos;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UACSImport.Commands.ImportUACSData;

/// <summary>
/// Handler for ImportUACSDataCommand that processes CSV file imports.
/// </summary>
public class ImportUACSDataCommandHandler(IUACSCsvImporter csvImporter)
    : IRequestHandler<ImportUACSDataCommand, ApiResponse<UACSImportResultResponse>>
{
    public async Task<ApiResponse<UACSImportResultResponse>> Handle(
        ImportUACSDataCommand request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.SegmentType) ||
            !Enum.TryParse<UACSSegmentTypeEnum>(request.SegmentType, true, out var segmentType))
        {
            return ApiResponse<UACSImportResultResponse>.Fail("Invalid segment type. Use FundSource, Organization, Location, MFOPAP, or Object.");
        }

        var result = await csvImporter.ImportAsync(
            request.File,
            segmentType,
            request.IsDryRun,
            request.ImportedBy,
            cancellationToken);

        var message = request.IsDryRun
            ? $"Validation completed: {result.SuccessfulRows} valid, {result.FailedRows} invalid rows."
            : $"Import completed: {result.SuccessfulRows} imported, {result.FailedRows} failed rows.";

        return ApiResponse<UACSImportResultResponse>.Success(result, message);
    }
}
