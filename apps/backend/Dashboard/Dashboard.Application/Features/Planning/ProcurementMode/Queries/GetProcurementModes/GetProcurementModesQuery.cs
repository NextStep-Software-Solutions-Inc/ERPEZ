using ERPEZ.Application.Features.Planning.ProcurementMode.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.ProcurementMode.Queries.GetProcurementModes;

public record GetProcurementModesQuery(SieveModel SieveModel) : IRequest<PaginatedApiResponse<ProcurementModeResponse>>;
