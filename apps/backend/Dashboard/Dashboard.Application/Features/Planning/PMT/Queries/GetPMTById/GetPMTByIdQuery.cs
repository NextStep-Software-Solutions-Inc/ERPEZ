using ERPEZ.Application.Features.Planning.PMT.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PMT.Queries.GetPMTById;

public record GetPMTByIdQuery(Guid Id) : IRequest<ApiResponse<PMTResponse>>;
