using ERPEZ.Application.Features.Planning.APP.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APP.Queries.GetAPPAnalytics;

public record GetAPPAnalyticsQuery(Guid AppId) : IRequest<ApiResponse<APPAnalyticsResponse>>;
