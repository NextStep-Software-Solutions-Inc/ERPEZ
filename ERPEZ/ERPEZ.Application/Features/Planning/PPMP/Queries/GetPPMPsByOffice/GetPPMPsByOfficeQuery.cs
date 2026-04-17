using ERPEZ.Application.Features.Planning.PPMP.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Queries.GetPPMPsByOffice;

public record GetPPMPsByOfficeQuery : IRequest<ApiResponse<List<PPMPDetailedResponse>>>
{
	public Guid OfficeId { get; init; }
}
