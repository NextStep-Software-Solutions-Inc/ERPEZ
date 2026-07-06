using ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Queries.GetConsolidatedPrItemsForRfq;

public record GetConsolidatedPrItemsForRfqQuery : IRequest<ApiResponse<List<ConsolidatedPrItemForRfqDto>>>;
