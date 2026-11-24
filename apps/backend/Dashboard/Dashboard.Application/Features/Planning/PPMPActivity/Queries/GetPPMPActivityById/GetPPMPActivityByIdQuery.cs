using ERPEZ.Application.Features.Planning.PPMPActivity.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPActivity.Queries.GetPPMPActivityById;

public record GetPPMPActivityByIdQuery(Guid Id) : IRequest<ApiResponse<PPMPActivityResponse>>;
