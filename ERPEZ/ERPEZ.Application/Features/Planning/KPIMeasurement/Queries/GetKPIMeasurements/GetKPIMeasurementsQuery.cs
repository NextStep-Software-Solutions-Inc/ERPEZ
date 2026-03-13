using ERPEZ.Application.Features.Planning.KPIMeasurement.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.KPIMeasurement.Queries.GetKPIMeasurements;

public record GetKPIMeasurementsQuery(SieveModel SieveModel) : IRequest<PaginatedApiResponse<KPIMeasurementResponse>>;
