using ERPEZ.Shared.Common;
using MediatR;
using System.Text.Json.Serialization;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.UpdateRFQ;

/// <summary>
/// Edits an RFQ's header fields and invited supplier list. Permitted while
/// Status is Draft or Returned.
/// </summary>
public class UpdateRFQCommand : IRequest<ApiResponse<bool>>
{
    /// <summary>
    /// Set server-side from the route parameter only. JsonIgnore prevents a client
    /// from smuggling a different RFQId in the request body than the one in the URL.
    /// </summary>
    [JsonIgnore]
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
