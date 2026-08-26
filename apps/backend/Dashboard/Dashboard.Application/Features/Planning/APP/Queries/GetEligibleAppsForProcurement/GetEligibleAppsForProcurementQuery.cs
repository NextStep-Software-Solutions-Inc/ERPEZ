using System.Collections.Generic;
using ERPEZ.Application.Features.Planning.APP.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APP.Queries.GetEligibleAppsForProcurement;

public record GetEligibleAppsForProcurementQuery : IRequest<ApiResponse<List<EligibleAppForProcurementDto>>>;
