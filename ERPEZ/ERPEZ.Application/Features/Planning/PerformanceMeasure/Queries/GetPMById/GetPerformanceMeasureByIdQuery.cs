using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PerformanceMeasure.Queries.GetPMById;

public record class GetPerformanceMeasureByIdQuery(Guid Id) : IRequest<ApiResponse<Domain.Entities.Planning.PerformanceMeasure>>;