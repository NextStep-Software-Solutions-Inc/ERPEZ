using ERPEZ.Application.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FundSource.Commands.ImportFundSourcesFromExcel;

public class ImportFundSourcesFromExcelCommandHandler(IFundSourceExcelImporter excelImporter) 
    : IRequestHandler<ImportFundSourcesFromExcelCommand, ApiResponse<int>>
{
    public async Task<ApiResponse<int>> Handle(ImportFundSourcesFromExcelCommand request, CancellationToken cancellationToken)
    {
        if (request.File == null || request.File.Length == 0)
            return ApiResponse<int>.Fail("No file was uploaded.");

        using var stream = request.File.OpenReadStream();
        var count = await excelImporter.ImportFromExcelAsync(stream, cancellationToken);
        return ApiResponse<int>.Success(count, $"Successfully imported {count} Fund Source records.");
    }
}
