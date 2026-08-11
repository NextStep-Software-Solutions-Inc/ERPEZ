using ERPEZ.Shared.Common;
using MediatR;
 
namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.SubmitRFQ;
 
public record SubmitRFQCommand(Guid RFQId) : IRequest<ApiResponse<bool>>;
