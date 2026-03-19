using ERPEZ.Application.Features.Planning.FYActiveKPIMeasurement.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FYActiveKPIMeasurement.Queries.GetFYActiveKPIMeasurementById;

public record GetFYActiveKPIMeasurementByIdQuery(Guid Id) : IRequest<ApiResponse<FYActiveKPIMeasurementResponse>>;
