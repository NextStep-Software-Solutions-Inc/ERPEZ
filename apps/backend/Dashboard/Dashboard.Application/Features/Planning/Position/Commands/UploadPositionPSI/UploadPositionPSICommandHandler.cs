using ERPEZ.Application.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Position.Commands.UploadPositionPSI;

public class UploadPositionPSICommandHandler(IPositionImportService importService)
    : IRequestHandler<UploadPositionPSICommand, ApiResponse<PositionImportResult>>
{
    public async Task<ApiResponse<PositionImportResult>> Handle(
        UploadPositionPSICommand request,
        CancellationToken cancellationToken)
    {
        var result = await importService.ImportFromExcelAsync(request.File, cancellationToken);

        return ApiResponse<PositionImportResult>.Success(
            result,
            $"Upload completed: {result.SuccessCount} positions imported, {result.FailureCount} failed.");
    }
}
