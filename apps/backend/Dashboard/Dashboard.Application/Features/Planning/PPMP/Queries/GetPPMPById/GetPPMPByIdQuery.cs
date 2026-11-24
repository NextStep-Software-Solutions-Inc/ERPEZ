using ERPEZ.Application.Features.Planning.PPMP.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMP.Queries.GetPPMPById;

public record GetPPMPByIdQuery(Guid Id) : IRequest<ApiResponse<PPMPDetailedResponse>>;
