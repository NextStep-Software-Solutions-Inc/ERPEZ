using System;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.GeneratePurchaseRequestDocument;

public record GeneratePurchaseRequestDocumentCommand : IRequest<ApiResponse<Guid>>
{
    public Guid PurchaseRequestId { get; init; }
    public ExportFormat Format { get; init; } = ExportFormat.Pdf;
    public string GeneratedBy { get; init; } = "system";
}
