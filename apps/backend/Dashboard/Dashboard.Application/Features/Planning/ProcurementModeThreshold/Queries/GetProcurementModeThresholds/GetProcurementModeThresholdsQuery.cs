using ERPEZ.Application.Features.Planning.ProcurementModeThreshold.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.ProcurementModeThreshold.Queries.GetProcurementModeThresholds;

public record GetProcurementModeThresholdsQuery(SieveModel SieveModel) : IRequest<PaginatedApiResponse<ProcurementModeThresholdResponse>>;
