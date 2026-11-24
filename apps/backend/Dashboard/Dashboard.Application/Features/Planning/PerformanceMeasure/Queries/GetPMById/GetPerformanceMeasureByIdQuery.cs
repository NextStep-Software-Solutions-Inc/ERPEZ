using ERPEZ.Application.Features.Planning.PerformanceMeasure.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PerformanceMeasure.Queries.GetPMById;

public record GetPerformanceMeasureByIdQuery(Guid Id) : IRequest<ApiResponse<PerformanceMeasureDetailedResponse>>;
