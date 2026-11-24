using System;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.GeneratePurchaseOrderDocument;

public record GeneratePurchaseOrderDocumentCommand : IRequest<ApiResponse<Guid>>
{
    public Guid PurchaseOrderId { get; init; }
    public ExportFormat Format { get; init; } = ExportFormat.Pdf;
    public string GeneratedBy { get; init; } = "system";
}
