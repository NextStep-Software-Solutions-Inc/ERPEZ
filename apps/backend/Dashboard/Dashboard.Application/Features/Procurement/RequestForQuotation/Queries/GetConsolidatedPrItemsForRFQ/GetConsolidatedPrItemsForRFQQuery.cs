using ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Queries.GetConsolidatedPrItemsForRFQ;

public record GetConsolidatedPrItemsForRFQQuery : IRequest<ApiResponse<List<ConsolidatedPrItemForRFQDto>>>;
