using ERPEZ.Shared.Common;
using MediatR;
 
namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.CreateRFQ;
 
public record CreateRFQCommand(
    string RFQNumber,
    string TracingNumber,
    string? Description,
    DateOnly Date,
    DateOnly? Deadline,
    string? DeliveryPeriod,
    string? Purpose,
    List<Guid> SupplierIds
) : IRequest<ApiResponse<Guid>>;
