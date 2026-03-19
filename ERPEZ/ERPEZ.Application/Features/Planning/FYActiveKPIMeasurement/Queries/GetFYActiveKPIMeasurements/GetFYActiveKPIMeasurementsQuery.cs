using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.FYActiveKPIMeasurement.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.FYActiveKPIMeasurement.Queries.GetFYActiveKPIMeasurements;

public record GetFYActiveKPIMeasurementsQuery : PaginatedQuery<PaginatedApiResponse<FYActiveKPIMeasurementResponse>>;
