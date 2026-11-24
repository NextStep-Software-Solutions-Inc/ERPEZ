using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
 
namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.ReopenRFQ;
 
/// <summary>Moves a Returned RFQ back to Draft so the BAC Sec can re-edit and resubmit.</summary>
public record ReopenRFQCommand(Guid RFQId) : IRequest<ApiResponse<bool>>;
