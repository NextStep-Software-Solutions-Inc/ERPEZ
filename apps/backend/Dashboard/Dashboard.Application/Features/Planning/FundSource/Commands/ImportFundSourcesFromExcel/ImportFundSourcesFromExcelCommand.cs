using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace ERPEZ.Application.Features.Planning.FundSource.Commands.ImportFundSourcesFromExcel;

public class ImportFundSourcesFromExcelCommand : IRequest<ApiResponse<int>>
{
    public required IFormFile File { get; init; }
}
