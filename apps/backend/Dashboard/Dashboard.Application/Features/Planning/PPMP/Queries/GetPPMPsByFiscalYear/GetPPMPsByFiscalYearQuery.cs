using ERPEZ.Application.Features.Planning.PPMP.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Queries.GetPPMPsByFiscalYear;

public record GetPPMPsByFiscalYearQuery : IRequest<ApiResponse<List<PPMPDetailedResponse>>>
{
	public Guid FiscalYearId { get; init; }
}
