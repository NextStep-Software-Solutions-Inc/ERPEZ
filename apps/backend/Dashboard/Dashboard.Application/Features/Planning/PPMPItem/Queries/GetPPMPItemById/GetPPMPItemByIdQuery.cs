using ERPEZ.Application.Features.Planning.PPMPItem.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPItem.Queries.GetPPMPItemById;

public record GetPPMPItemByIdQuery(Guid Id) : IRequest<ApiResponse<PPMPItemResponse>>;
