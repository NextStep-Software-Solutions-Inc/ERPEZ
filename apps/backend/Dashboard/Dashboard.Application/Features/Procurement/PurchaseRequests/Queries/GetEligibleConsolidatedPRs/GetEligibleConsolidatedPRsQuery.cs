using System.Collections.Generic;
using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetEligibleConsolidatedPRs;

public record GetEligibleConsolidatedPRsQuery : IRequest<ApiResponse<List<EligibleConsolidatedPRDto>>>;
