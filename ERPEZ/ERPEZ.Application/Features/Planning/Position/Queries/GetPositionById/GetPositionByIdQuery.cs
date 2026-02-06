using ERPEZ.Application.Features.Planning.Position.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Position.Queries.GetPositionById;

public record GetPositionByIdQuery(Guid Id) : IRequest<ApiResponse<PositionResponse>>;
