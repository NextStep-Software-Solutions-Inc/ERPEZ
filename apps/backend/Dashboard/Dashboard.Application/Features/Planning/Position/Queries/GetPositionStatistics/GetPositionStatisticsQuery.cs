using ERPEZ.Application.Features.Planning.Position.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Position.Queries.GetPositionStatistics;

public record GetPositionStatisticsQuery : IRequest<ApiResponse<PositionStatisticsResponse>>;
