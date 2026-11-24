using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Common.Dtos;
using ERPEZ.Application.Common.Helpers;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.GeneratePurchaseRequestDocument;

public class GeneratePurchaseRequestDocumentCommandHandler(
    IUnitOfWork unitOfWork,
    IDocumentRendererService rendererService,
    IDocumentStorageService storageService)
    : IRequestHandler<GeneratePurchaseRequestDocumentCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        GeneratePurchaseRequestDocumentCommand request,
        CancellationToken cancellationToken)
    {
        // 1. Fetch PR entity with full details
        var pr = await unitOfWork.PurchaseRequestRepository
            .GetPRWithDetailsAsync(request.PurchaseRequestId, cancellationToken)
            ?? throw new NotFoundException($"Purchase Request with ID '{request.PurchaseRequestId}' was not found.");

        // 2. Map domain entity to PurchaseRequestDataDto
        var dataDto = await MapToDataDtoAsync(pr, cancellationToken);

        // 3. Render document using QuestPDF renderer
        var bytes = await rendererService.RenderAsync(
            dataDto, DocumentType.PurchaseRequest, request.Format, cancellationToken);

        // 4. Save file to storage
        var extension = request.Format == ExportFormat.Excel ? "xlsx" : "pdf";
        var fileName = $"PR_{pr.PRNumber}_{DateTime.UtcNow:yyyyMMddHHmmss}.{extension}";
        var path = await storageService.SaveAsync(bytes, fileName, cancellationToken);

        // 5. Persist record in GeneratedDocuments
        var record = new GeneratedDocument
        {
            DocumentType = DocumentType.PurchaseRequest,
            Format = request.Format,
            OfficeId = pr.OfficeId,
            StoragePath = path,
            FileName = fileName,
            FileSizeBytes = bytes.Length,
            FiscalYear = pr.RequestedDate.Year.ToString(),
            GeneratedBy = request.GeneratedBy
        };

        await unitOfWork.GeneratedDocumentRepository.AddAsync(record, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(record.Id, "Purchase Request document generated successfully.");
    }

    private async Task<PurchaseRequestDataDto> MapToDataDtoAsync(Domain.Entities.Procurement.PurchaseRequest pr, CancellationToken cancellationToken)
    {
        int itemNo = 1;
        var activeItems = pr.PRItems.Where(i => !i.IsDeleted).OrderBy(i => i.CreatedAt).ToList();

        var itemDtos = activeItems.Select(i =>
        {
            var name = !string.IsNullOrWhiteSpace(i.Name)
                ? i.Name
                : (i.PPMPItem?.Name ?? i.PPMPItem?.NonCSEItem?.Name ?? i.PPMPItem?.CSEItem?.Name ?? "Item");

            var desc = !string.IsNullOrWhiteSpace(i.Description)
                ? i.Description
                : (!string.IsNullOrWhiteSpace(i.PPMPItem?.Description)
                    ? i.PPMPItem.Description
                    : (i.PPMPItem?.NonCSEItem?.Description ?? string.Empty));

            var unit = !string.IsNullOrWhiteSpace(i.PPMPItem?.Unit)
                ? i.PPMPItem.Unit
                : (i.PPMPItem?.NonCSEItem?.UOM?.Name ?? i.PPMPItem?.CSEItem?.UOM?.Name ?? "unit");

            var unitCost = i.UnitCost > 0 ? i.UnitCost : (i.PPMPItem?.UnitPrice ?? 0);
            var totalCost = i.Amount > 0 ? i.Amount : (i.RequestedQuantity * unitCost);

            return new PurchaseRequestItemRowDto
            {
                ItemNo = itemNo++,
                ItemName = name,
                Description = desc,
                Quantity = i.RequestedQuantity,
                Unit = unit,
                UnitCost = unitCost,
                TotalCost = totalCost
            };
        }).ToList();

        var totalAmount = pr.TotalAmount > 0
            ? pr.TotalAmount
            : itemDtos.Sum(i => i.TotalCost);

        // Dynamic Signatories Resolution
        var wf = await DocumentSignatoryResolver
            .ResolveWorkflowApproversAsync(unitOfWork, pr.OfficeId, null, "PR", cancellationToken);

        var submitEvent = pr.ApprovalEvents?
            .Where(e => !e.IsDeleted &&
                        (string.Equals(e.Action, "Submitted", StringComparison.OrdinalIgnoreCase) ||
                         string.Equals(e.Action, "Submit", StringComparison.OrdinalIgnoreCase)))
            .OrderByDescending(e => e.Timestamp)
            .FirstOrDefault();

        var requestedByUser = await DocumentSignatoryResolver
            .ResolveUserSignatoryAsync(unitOfWork, submitEvent?.ActorId, cancellationToken);

        var financeSignatory = await DocumentSignatoryResolver
            .ResolveFinanceSignatoryAsync(unitOfWork, cancellationToken);

        string reqName = !string.IsNullOrWhiteSpace(requestedByUser?.FullName)
            ? requestedByUser.FullName
            : (!string.IsNullOrWhiteSpace(submitEvent?.ActorName)
                ? submitEvent.ActorName
                : (!string.IsNullOrWhiteSpace(pr.CreatedBy) ? pr.CreatedBy : (pr.Office?.Name ?? "END-USER")));

        string reqPos = !string.IsNullOrWhiteSpace(requestedByUser?.PositionTitle)
            ? requestedByUser.PositionTitle
            : (!string.IsNullOrWhiteSpace(submitEvent?.Role) ? submitEvent.Role : (pr.Office?.Name ?? "Requesting Office"));

        string recName = !string.IsNullOrWhiteSpace(wf.RecommendingApprover?.FullName)
            ? wf.RecommendingApprover.FullName
            : "[Recommending Approver]";
        string recPos = !string.IsNullOrWhiteSpace(wf.RecommendingApprover?.PositionTitle)
            ? wf.RecommendingApprover.PositionTitle
            : "Recommending Approver";

        string finalName = !string.IsNullOrWhiteSpace(wf.FinalApprover?.FullName)
            ? wf.FinalApprover.FullName
            : "[Head of Procuring Entity]";
        string finalPos = !string.IsNullOrWhiteSpace(wf.FinalApprover?.PositionTitle)
            ? wf.FinalApprover.PositionTitle
            : "Head of Procuring Entity";

        string fundsName = !string.IsNullOrWhiteSpace(financeSignatory?.FullName)
            ? financeSignatory.FullName
            : "[Budget Officer / FMS Director]";
        string fundsPos = !string.IsNullOrWhiteSpace(financeSignatory?.PositionTitle)
            ? financeSignatory.PositionTitle
            : "Financial Management Services";

        var signatories = new List<SignatoryDto>
        {
            new()
            {
                Label = "Requested by:",
                PrintedName = reqName,
                Position = reqPos,
                Designation = "END-USER",
                Date = pr.RequestedDate.ToDateTime(TimeOnly.MinValue)
            },
            new()
            {
                Label = "Recommending Approval:",
                PrintedName = recName,
                Position = recPos,
                Designation = "Recommending Approval"
            },
            new()
            {
                Label = "Funds Available:",
                PrintedName = fundsName,
                Position = fundsPos,
                Designation = "Funds Available"
            },
            new()
            {
                Label = "Approved by:",
                PrintedName = finalName,
                Position = finalPos,
                Designation = "Approved by"
            }
        };

        return new PurchaseRequestDataDto
        {
            OfficeId = pr.OfficeId,
            EntityName = "[Agency Name]",
            FundCluster = pr.FundSource?.Name ?? (activeItems.FirstOrDefault()?.PPMPItem?.PPMPExpenditureItem?.PPMP?.FundSource?.Name ?? string.Empty),
            UacsCode = pr.UACSCodeCombination?.CombinationCode ?? string.Empty,
            OfficeSection = pr.Office?.Name ?? string.Empty,
            PRNumber = pr.PRNumber,
            Date = pr.RequestedDate,
            ResponsibilityCenterCode = "000 - (PPE)",
            Status = pr.Status.ToString().ToUpperInvariant(),
            Purpose = !string.IsNullOrWhiteSpace(pr.Purpose) ? pr.Purpose : (pr.Description ?? string.Empty),
            TotalAmount = totalAmount,
            Items = itemDtos,
            Signatories = signatories
        };
    }
}
