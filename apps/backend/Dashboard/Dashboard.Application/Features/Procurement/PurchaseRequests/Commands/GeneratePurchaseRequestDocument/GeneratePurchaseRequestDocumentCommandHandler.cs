using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Common.Dtos;
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
        var matrix = await unitOfWork.WorkflowMatrixRepository.FindAsync(
            m => m.OfficeId == pr.OfficeId && !m.IsDeleted,
            cancellationToken);

        string recName = "[Recommending Approver]";
        string recPos = "Recommending Approver";

        if (matrix != null && matrix.RecommendingApproverPositionId != Guid.Empty)
        {
            var recPosEntity = await unitOfWork.PositionRepository.GetByIdAsync(matrix.RecommendingApproverPositionId, cancellationToken);
            if (recPosEntity != null)
            {
                recPos = recPosEntity.Title;
                var recPersonnel = await unitOfWork.PersonnelPositionRepository.FindAsync(
                    pp => pp.PositionId == recPosEntity.Id && !pp.IsDeleted, cancellationToken);
                if (recPersonnel?.UserId != null)
                {
                    var recUser = await unitOfWork.UserRepository.GetByIdAsync(recPersonnel.UserId, cancellationToken);
                    if (recUser != null && !string.IsNullOrWhiteSpace(recUser.FullName))
                        recName = recUser.FullName;
                }
            }
        }

        string finalName = "[Head of Procuring Entity]";
        string finalPos = "Head of Procuring Entity";

        if (matrix != null && matrix.FinalApproverPositionId != Guid.Empty)
        {
            var finalPosEntity = await unitOfWork.PositionRepository.GetByIdAsync(matrix.FinalApproverPositionId, cancellationToken);
            if (finalPosEntity != null)
            {
                finalPos = finalPosEntity.Title;
                var finalPersonnel = await unitOfWork.PersonnelPositionRepository.FindAsync(
                    pp => pp.PositionId == finalPosEntity.Id && !pp.IsDeleted, cancellationToken);
                if (finalPersonnel?.UserId != null)
                {
                    var finalUser = await unitOfWork.UserRepository.GetByIdAsync(finalPersonnel.UserId, cancellationToken);
                    if (finalUser != null && !string.IsNullOrWhiteSpace(finalUser.FullName))
                        finalName = finalUser.FullName;
                }
            }
        }

        // Funds available - look up finance user / position
        string fundsName = "[Budget Officer / FMS Director]";
        string fundsPos = "Financial Management Services";

        var financeUsers = await unitOfWork.UserRepository.FindAllAsync(
            u => !u.IsDeleted && (u.Office != null && (u.Office.Code == "FMS" || u.Office.Name.Contains("Finance"))),
            cancellationToken);
        var fUser = financeUsers.FirstOrDefault();
        if (fUser != null && !string.IsNullOrWhiteSpace(fUser.FullName))
        {
            fundsName = fUser.FullName;
            var posAssignment = await unitOfWork.PersonnelPositionRepository.FindAsync(
                pp => pp.UserId == fUser.Id && !pp.IsDeleted, cancellationToken);
            if (posAssignment?.PositionId != null)
            {
                var pos = await unitOfWork.PositionRepository.GetByIdAsync(posAssignment.PositionId, cancellationToken);
                if (pos != null) fundsPos = pos.Title;
            }
        }

        var signatories = new List<SignatoryDto>
        {
            new()
            {
                Label = "Requested by:",
                PrintedName = !string.IsNullOrWhiteSpace(pr.CreatedBy) ? pr.CreatedBy : (pr.Office?.Name ?? "END-USER"),
                Position = pr.Office?.Name ?? "Requesting Office",
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
