using ERPEZ.Shared.Common;
using MediatR;
 
namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.RemoveRFQItem;
 
public record RemoveRFQItemCommand(Guid RFQId, Guid RFQItemId) : IRequest<ApiResponse<bool>>;
