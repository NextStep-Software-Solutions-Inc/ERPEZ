using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.KPIMeasurement.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.KPIMeasurement.Queries.GetKPIMeasurements;

public record GetKPIMeasurementsQuery : PaginatedQuery<PaginatedApiResponse<KPIMeasurementResponse>>;
