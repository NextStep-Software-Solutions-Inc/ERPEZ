using ERPEZ.Application.Features.Planning.APP.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APP.Queries.GetAPPBAC;

public record GetAPPBACQuery(Guid APPId) : IRequest<ApiResponse<BACResponse>>;

