using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPI.Queries.GetKPIByIdQuery;

public record GetKPIByIdQuery(Guid Id) : IRequest<ApiResponse<Domain.Entities.Planning.KPI>>;