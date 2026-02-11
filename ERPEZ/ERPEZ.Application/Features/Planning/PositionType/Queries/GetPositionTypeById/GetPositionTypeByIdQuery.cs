using ERPEZ.Application.Features.Planning.PositionType.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PositionType.Queries.GetPositionTypeById;

public record GetPositionTypeByIdQuery(Guid Id) : IRequest<ApiResponse<PositionTypeResponse>>;
