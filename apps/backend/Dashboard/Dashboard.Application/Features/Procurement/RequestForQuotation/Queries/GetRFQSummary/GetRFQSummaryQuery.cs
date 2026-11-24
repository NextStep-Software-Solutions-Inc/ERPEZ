using ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
 
namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Queries.GetRFQSummary;
 
public record GetRFQSummaryQuery : IRequest<ApiResponse<RFQSummaryDto>>;
