using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.Utils;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Queries.GetPurchaseOrderPdf;

public class GetPurchaseOrderPdfQueryHandler(
    IUnitOfWork unitOfWork,
    IDocumentRendererService rendererService)
    : IRequestHandler<GetPurchaseOrderPdfQuery, ApiResponse<PurchaseOrderPdfFileResult>>
{
    public async Task<ApiResponse<PurchaseOrderPdfFileResult>> Handle(
        GetPurchaseOrderPdfQuery request,
        CancellationToken cancellationToken)
    {
        var purchaseOrder = await unitOfWork.PurchaseOrderRepository.GetByIdWithDetailsAsync(
            request.PurchaseOrderId, cancellationToken)
            ?? throw new NotFoundException("Purchase Order not found.");

        var dataDto = await PurchaseOrderDataResolver.ResolveDataDtoAsync(
            purchaseOrder, unitOfWork, cancellationToken);

        var bytes = await rendererService.RenderAsync(
            dataDto,
            DocumentType.PurchaseOrder,
            ExportFormat.Pdf,
            cancellationToken);

        var fileName = $"{purchaseOrder.PONumber}_Purchase_Order.pdf";
        return ApiResponse<PurchaseOrderPdfFileResult>.Success(
            new PurchaseOrderPdfFileResult(bytes, fileName, "application/pdf"),
            "Purchase Order PDF rendered successfully.");
    }
}
