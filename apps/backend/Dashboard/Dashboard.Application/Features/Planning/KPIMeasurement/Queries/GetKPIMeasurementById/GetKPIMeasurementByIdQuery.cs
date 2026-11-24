using ERPEZ.Application.Features.Planning.KPIMeasurement.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPIMeasurement.Queries.GetKPIMeasurementById;

public record GetKPIMeasurementByIdQuery(Guid Id) : IRequest<ApiResponse<KPIMeasurementResponse>>;
