using ERPEZ.Application.Features.Planning.KPI.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPI.Queries.GetKPIByIdQuery;

public record GetKPIByIdQuery(Guid Id) : IRequest<ApiResponse<KPIResponse>>;
