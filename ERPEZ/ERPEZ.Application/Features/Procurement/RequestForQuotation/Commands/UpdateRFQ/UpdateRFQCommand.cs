using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.UpdateRFQ;

/// <summary>
/// Edits an RFQ's header fields and invited supplier list. Only permitted while
/// Status == Draft — Submitted/Approved/Returned RFQs must go through Reopen first.
/// </summary>
public class UpdateRFQCommand : IRequest<ApiResponse<bool>>
{
    public Guid RFQId { get; set; }
    public string RFQNumber { get; set; } = string.Empty;
    public string TracingNumber { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateOnly Date { get; set; }
    public DateOnly? Deadline { get; set; }
    public string? DeliveryPeriod { get; set; }
    public string? Purpose { get; set; }

    /// <summary>Full replacement of the invited supplier list.</summary>
    public List<Guid> SupplierIds { get; set; } = [];
}
