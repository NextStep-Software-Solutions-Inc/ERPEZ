using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.Utils;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Commands.GeneratePurchaseOrderDocument;

public class GeneratePurchaseOrderDocumentCommandHandler(
    IUnitOfWork unitOfWork,
    IDocumentRendererService rendererService,
    IDocumentStorageService storageService,
    ERPEZ.Shared.Interfaces.ITenantContextService tenantContext)
    : IRequestHandler<GeneratePurchaseOrderDocumentCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        GeneratePurchaseOrderDocumentCommand request,
        CancellationToken cancellationToken)
    {
        var purchaseOrder = await unitOfWork.PurchaseOrderRepository.GetByIdWithDetailsAsync(
            request.PurchaseOrderId, cancellationToken)
            ?? throw new NotFoundException("Purchase Order not found.");

        var dataDto = await PurchaseOrderDataResolver.ResolveDataDtoAsync(
            purchaseOrder, unitOfWork, tenantContext, cancellationToken);

        // Render document (QuestPDF)
        var bytes = await rendererService.RenderAsync(
            dataDto,
            DocumentType.PurchaseOrder,
            request.Format,
            cancellationToken);

        var extension = request.Format == ExportFormat.Excel ? "xlsx" : "pdf";
        var fileName = $"{purchaseOrder.PONumber}_Purchase_Order.{extension}";

        // Save to document storage
        var storagePath = await storageService.SaveAsync(bytes, fileName, cancellationToken);

        // Audit GeneratedDocument record
        var record = new GeneratedDocument
        {
            DocumentType = DocumentType.PurchaseOrder,
            Format = request.Format,
            SourceDocumentId = purchaseOrder.Id,
            StoragePath = storagePath,
            FileName = fileName,
            FileSizeBytes = bytes.Length,
            FiscalYear = DateTime.UtcNow.Year.ToString(),
            GeneratedBy = request.GeneratedBy
        };

        await unitOfWork.GeneratedDocumentRepository.AddAsync(record, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(record.Id, "Purchase Order document generated successfully.");
    }
}
