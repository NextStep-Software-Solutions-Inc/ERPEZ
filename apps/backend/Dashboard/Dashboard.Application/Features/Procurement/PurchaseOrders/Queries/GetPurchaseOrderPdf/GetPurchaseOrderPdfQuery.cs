using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Queries.GetPurchaseOrderPdf;

public record PurchaseOrderPdfFileResult(byte[] FileBytes, string FileName, string ContentType);

public record GetPurchaseOrderPdfQuery(Guid PurchaseOrderId) : IRequest<ApiResponse<PurchaseOrderPdfFileResult>>;
