using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.DirectContractings.Dtos;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.GenerateDirectContractingDocument;

public class GenerateDirectContractingDocumentCommandHandler(
    IUnitOfWork unitOfWork,
    IDocumentRendererService rendererService,
    IDocumentStorageService storageService,
    IConfiguration configuration,
    ILogger<GenerateDirectContractingDocumentCommandHandler> logger)
    : IRequestHandler<GenerateDirectContractingDocumentCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        GenerateDirectContractingDocumentCommand request,
        CancellationToken cancellationToken)
    {
        var dc = await unitOfWork.DirectContractingRepository.Query()
            .Include(d => d.BACProject)
                .ThenInclude(p => p.BACResolutions)
            .Include(d => d.BACProject)
                .ThenInclude(p => p.ConsolidatedPR)
                    .ThenInclude(c => c!.ConsolidatedPRItems)
                        .ThenInclude(ci => ci.PRItem)
                            .ThenInclude(pri => pri.PPMPItem)
            .Include(d => d.BACProject)
                .ThenInclude(p => p.ConsolidatedPR)
                    .ThenInclude(c => c!.ConsolidatedPRItems)
                        .ThenInclude(ci => ci.PurchaseRequest)
                            .ThenInclude(pr => pr.Office)
            .Include(d => d.BACProject)
                .ThenInclude(p => p.APPItemLinks)
                    .ThenInclude(l => l.APPItem)
                        .ThenInclude(ai => ai.PPMPItem)
                            .ThenInclude(pi => pi!.PPMPItemAllocations)
            .Include(d => d.BACProject)
                .ThenInclude(p => p.APPItemLinks)
                    .ThenInclude(l => l.APPItem)
                        .ThenInclude(ai => ai.Office)
            .Include(d => d.BACProject)
                .ThenInclude(p => p.APPItem)
                    .ThenInclude(ai => ai!.PPMPItem)
                        .ThenInclude(pi => pi!.PPMPItemAllocations)
            .Include(d => d.BACProject)
                .ThenInclude(p => p.APPItem)
                    .ThenInclude(ai => ai!.Office)
            .Include(d => d.ExclusiveSupplier)
            .Include(d => d.Proposal)
                .ThenInclude(p => p!.ProposalItems)
                    .ThenInclude(pi => pi.CPRItem)
            .Where(d => d.Id == request.DirectContractingId && !d.IsDeleted)
            .AsSplitQuery()
            .FirstOrDefaultAsync(cancellationToken);

        if (dc == null)
        {
            throw new NotFoundException($"Direct Contracting record with ID '{request.DirectContractingId}' was not found.");
        }

        logger.LogInformation("Generating Direct Contracting PDF document for DC {DCNumber} (ID: {DCId})", dc.DCNumber, dc.Id);

        // 1. Resolve Line Items
        var rawItems = new List<DirectContractingItemResponse>();
        string officeName = string.Empty;

        if (dc.BACProject != null)
        {
            if (dc.BACProject.SourceType == ProcurementProjectSourceType.ConsolidatedPR && dc.BACProject.ConsolidatedPR != null)
            {
                foreach (var cprItem in dc.BACProject.ConsolidatedPR.ConsolidatedPRItems.Where(ci => !ci.IsDeleted))
                {
                    var prItem = cprItem.PRItem;
                    if (prItem == null || prItem.IsDeleted) continue;

                    var ppmpItem = prItem.PPMPItem;
                    int quantity = prItem.RequestedQuantity;
                    decimal unitPrice = prItem.UnitCost;
                    decimal totalAmount = prItem.Amount > 0 ? prItem.Amount : (quantity * unitPrice);

                    var canonicalId = prItem.PPMPItemId ?? cprItem.Id;
                    if (string.IsNullOrWhiteSpace(officeName) && cprItem.PurchaseRequest?.Office?.Name != null)
                    {
                        officeName = cprItem.PurchaseRequest.Office.Name;
                    }

                    rawItems.Add(new DirectContractingItemResponse
                    {
                        Id = canonicalId,
                        CPRItemId = canonicalId,
                        SourceItemId = cprItem.Id,
                        ItemName = prItem.Name,
                        Description = prItem.Description ?? ppmpItem?.Description,
                        Unit = ppmpItem?.Unit ?? "unit",
                        Quantity = quantity,
                        UnitABC = unitPrice,
                        TotalABC = totalAmount,
                        Office = cprItem.PurchaseRequest?.Office?.Name ?? string.Empty,
                        PRNumber = cprItem.PurchaseRequest?.PRNumber,
                        PAPCode = ppmpItem?.PAPCode,
                        Category = ppmpItem?.ProjectType.ToString() ?? (prItem.IsNonCSE ? "Non-CSE" : "CSE"),
                        SourceType = "ConsolidatedPR"
                    });
                }
            }
            else if (dc.BACProject.SourceType == ProcurementProjectSourceType.APPItem)
            {
                var appItemList = new List<APPItem>();
                if (dc.BACProject.APPItemLinks != null && dc.BACProject.APPItemLinks.Count > 0)
                {
                    appItemList.AddRange(dc.BACProject.APPItemLinks
                        .Where(l => !l.IsDeleted && l.APPItem != null && !l.APPItem.IsDeleted)
                        .OrderBy(l => l.Order)
                        .Select(l => l.APPItem));
                }
                else if (dc.BACProject.APPItem != null && !dc.BACProject.APPItem.IsDeleted)
                {
                    appItemList.Add(dc.BACProject.APPItem);
                }

                foreach (var appItem in appItemList)
                {
                    var ppmpItem = appItem.PPMPItem;
                    int quantity = 1;
                    if (ppmpItem != null)
                    {
                        var allocSum = ppmpItem.PPMPItemAllocations != null && ppmpItem.PPMPItemAllocations.Any(a => !a.IsDeleted)
                            ? ppmpItem.PPMPItemAllocations.Where(a => !a.IsDeleted).Sum(a => a.Quantity)
                            : 0;
                        quantity = allocSum > 0 ? allocSum : (ppmpItem.PlannedQuantity > 0 ? ppmpItem.PlannedQuantity : 1);
                    }

                    decimal totalABC = appItem.EffectiveABC;
                    decimal unitABC = quantity > 0 ? (totalABC / quantity) : totalABC;
                    var canonicalId = appItem.PPMPItemId != Guid.Empty ? appItem.PPMPItemId : appItem.Id;

                    if (string.IsNullOrWhiteSpace(officeName) && appItem.Office?.Name != null)
                    {
                        officeName = appItem.Office.Name;
                    }

                    rawItems.Add(new DirectContractingItemResponse
                    {
                        Id = canonicalId,
                        CPRItemId = canonicalId,
                        SourceItemId = appItem.Id,
                        ItemName = !string.IsNullOrWhiteSpace(appItem.ItemNameOverride) ? appItem.ItemNameOverride : (ppmpItem?.Name ?? appItem.Remarks ?? "APP Item"),
                        Description = appItem.GeneralDescription ?? ppmpItem?.Description,
                        Unit = ppmpItem?.Unit ?? "unit",
                        Quantity = quantity,
                        UnitABC = unitABC,
                        TotalABC = totalABC,
                        Office = appItem.Office?.Name ?? string.Empty,
                        PRNumber = null,
                        PAPCode = !string.IsNullOrWhiteSpace(appItem.PAPCode) ? appItem.PAPCode : ppmpItem?.PAPCode,
                        Category = ppmpItem?.ProjectType.ToString() ?? "APP",
                        SourceType = "APPItem"
                    });
                }
            }
        }

        // 2. Map PDF Expenditure Items & Validate ABC Limit (RA 12009 Compliance)
        var pdfItems = new List<DirectContractingPdfItemDto>();
        bool hasProposal = dc.Proposal != null;
        decimal totalProposed = hasProposal ? dc.Proposal!.TotalProposalAmount : 0m;
        decimal effectiveTotalABC = dc.TotalABC > 0 ? dc.TotalABC : rawItems.Sum(i => i.TotalABC);

        if (hasProposal && totalProposed > effectiveTotalABC && effectiveTotalABC > 0)
        {
            throw new InvalidOperationException(
                $"Total proposal amount (Php {totalProposed:N2}) exceeds the Approved Budget for the Contract (Php {effectiveTotalABC:N2}). " +
                "Under RA 12009 Section 35, single-source direct contracting award cannot exceed the ABC.");
        }

        int itemIdx = 1;
        foreach (var rawItem in rawItems)
        {
            DirectContractingProposalItem? propItem = null;
            if (hasProposal && dc.Proposal?.ProposalItems != null)
            {
                propItem = dc.Proposal.ProposalItems.FirstOrDefault(p =>
                    p.CPRItemId == rawItem.CPRItemId || p.CPRItemId == rawItem.Id);
            }

            decimal unitBid = propItem != null && propItem.UnitBid > 0 ? propItem.UnitBid : rawItem.UnitABC;
            decimal totalBid = propItem != null && propItem.TotalBid > 0 ? propItem.TotalBid : (unitBid * rawItem.Quantity);

            pdfItems.Add(new DirectContractingPdfItemDto
            {
                ItemNo = itemIdx++,
                ItemName = rawItem.ItemName,
                Description = rawItem.Description ?? string.Empty,
                Specifications = !string.IsNullOrWhiteSpace(propItem?.Brand)
                    ? $"{propItem.Brand} {propItem.Model} {propItem.Color}".Trim()
                    : (rawItem.Description ?? rawItem.ItemName),
                Quantity = rawItem.Quantity,
                Unit = rawItem.Unit,
                UnitABC = rawItem.UnitABC,
                TotalABC = rawItem.TotalABC,
                UnitBid = unitBid,
                TotalBid = totalBid,
                Brand = propItem?.Brand ?? string.Empty,
                Model = propItem?.Model ?? string.Empty
            });
        }

        // 3. Sourcing Supplier Profile
        var supplier = dc.ExclusiveSupplier;
        var supplierDto = new DirectContractingPdfSupplierDto
        {
            SupplierId = dc.ExclusiveSupplierId,
            Name = supplier?.Name ?? "Exclusive Supplier",
            Address = supplier?.Address ?? "Philippines",
            TINNumber = supplier?.TINNumber ?? "N/A",
            PhilGEPSNumber = supplier?.PhilGEPSNumber ?? "N/A",
            ContactPerson = supplier?.ContactPerson ?? string.Empty,
            ContactNumber = supplier?.ContactNumber ?? string.Empty,
            Email = supplier?.Email ?? string.Empty
        };

        // 4. Sourcing Legal Justification under RA 12009
        var statutoryGround = !string.IsNullOrWhiteSpace(request.StatutoryGround)
            ? request.StatutoryGround
            : "Section 35, Republic Act No. 12009 (New Government Procurement Act - NGPA)";

        var justificationRemarks = !string.IsNullOrWhiteSpace(request.JustificationRemarks)
            ? request.JustificationRemarks
            : (!string.IsNullOrWhiteSpace(dc.ReviewRemarks)
                ? dc.ReviewRemarks
                : (dc.Proposal?.ProposalRemarks ?? "Direct Contracting is justified as the procurement involves proprietary goods/services obtainable solely from the exclusive manufacturer or authorized sole distributor, with no suitable substitute available in the market."));

        var marketScopingSummary = !string.IsNullOrWhiteSpace(request.MarketScopingSummary)
            ? request.MarketScopingSummary
            : "Market verification and scoping confirm exclusivity of rights, patents, or proprietary manufacturing standards without equivalent alternatives in the market.";

        var exclusivityVerification = !string.IsNullOrWhiteSpace(dc.Proposal?.ExclusivityDocumentUrl)
            ? $"Certificate of Exclusivity / Proprietary Sole Distributorship verified: {dc.Proposal.ExclusivityDocumentUrl}"
            : "Sole Distributorship and Exclusivity documentation verified in accordance with COA and RA 12009 statutory requirements.";

        // 5. Hydrate Signatory Matrix
        var bacMemberEntities = await unitOfWork.BACMemberRepository.FindAllAsync(m => m.IsActive, cancellationToken);
        var sortedBacMembers = bacMemberEntities.OrderBy(m => m.Order).ToList();

        var signatories = new List<DirectContractingPdfSignatoryDto>();
        foreach (var m in sortedBacMembers)
        {
            signatories.Add(new DirectContractingPdfSignatoryDto
            {
                Name = m.FullName,
                Position = m.Position,
                Role = m.Role,
                Order = m.Order
            });
        }

        // Fallback default signatories if BAC member table is empty
        if (!signatories.Any())
        {
            signatories.Add(new DirectContractingPdfSignatoryDto { Name = string.Empty, Position = "BAC Regular Member", Role = "Member", Order = 1 });
            signatories.Add(new DirectContractingPdfSignatoryDto { Name = string.Empty, Position = "BAC Regular Member", Role = "Member", Order = 2 });
            signatories.Add(new DirectContractingPdfSignatoryDto { Name = string.Empty, Position = "BAC Vice Chairperson", Role = "Vice Chairperson", Order = 3 });
            signatories.Add(new DirectContractingPdfSignatoryDto { Name = string.Empty, Position = "BAC Chairperson", Role = "Chairperson", Order = 4 });
        }

        var headOfAgencyName = !string.IsNullOrWhiteSpace(request.HeadOfAgencyName)
            ? request.HeadOfAgencyName
            : (configuration["BacDocument:HeadOfAgencyName"] ?? string.Empty);

        var headOfAgencyTitle = !string.IsNullOrWhiteSpace(request.HeadOfAgencyTitle)
            ? request.HeadOfAgencyTitle
            : (configuration["BacDocument:HeadOfAgencyTitle"] ?? "HEAD OF THE PROCURING ENTITY");

        var secretariatHeadName = !string.IsNullOrWhiteSpace(request.BacSecretariatHeadName)
            ? request.BacSecretariatHeadName
            : (configuration["BacDocument:BacSecretariatHeadName"] ?? string.Empty);

        var secretariatHeadTitle = !string.IsNullOrWhiteSpace(request.BacSecretariatHeadTitle)
            ? request.BacSecretariatHeadTitle
            : (configuration["BacDocument:BacSecretariatHeadTitle"] ?? "Head, BAC Secretariat");

        // 6. Build PDF Data DTO
        var dataDto = new DirectContractingPdfDataDto
        {
            DirectContractingId = dc.Id,
            DocumentControlNumber = dc.DCNumber,
            Date = dc.CreatedAt,
            ProcurementProjectReference = dc.BACProject?.Title ?? dc.Name,
            OfficeName = officeName,
            Supplier = supplierDto,
            StatutoryGround = statutoryGround,
            JustificationRemarks = justificationRemarks,
            MarketScopingSummary = marketScopingSummary,
            ExclusivityVerification = exclusivityVerification,
            ApprovedBudgetForContract = effectiveTotalABC,
            TotalProposalAmount = totalProposed > 0 ? totalProposed : pdfItems.Sum(i => i.TotalBid),
            HasSubmittedProposal = hasProposal,
            Items = pdfItems,
            Signatories = signatories,
            HeadOfAgencyName = headOfAgencyName,
            HeadOfAgencyTitle = headOfAgencyTitle,
            BacSecretariatHeadName = secretariatHeadName,
            BacSecretariatHeadTitle = secretariatHeadTitle
        };

        // 7. Render Document
        var bytes = await rendererService.RenderAsync(
            dataDto,
            DocumentType.DirectContracting,
            request.Format,
            cancellationToken);

        // 8. Save Generated Binary
        var extension = request.Format == ExportFormat.Excel ? "xlsx" : "pdf";
        var fileName = $"Direct_Contracting_Justification_{dc.DCNumber}_{DateTime.UtcNow:yyyyMMddHHmmss}.{extension}";
        var storagePath = await storageService.SaveAsync(bytes, fileName, cancellationToken);

        // 9. Create Audit Record in GeneratedDocuments
        var record = new GeneratedDocument
        {
            DocumentType = DocumentType.DirectContracting,
            Format = request.Format,
            SourceDocumentId = dc.Id,
            StoragePath = storagePath,
            FileName = fileName,
            FileSizeBytes = bytes.Length,
            FiscalYear = DateTime.UtcNow.Year.ToString(),
            GeneratedBy = !string.IsNullOrWhiteSpace(request.GeneratedBy) ? request.GeneratedBy.Trim() : "system"
        };

        await unitOfWork.GeneratedDocumentRepository.AddAsync(record, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(record.Id, "Direct Contracting document generated successfully.");
    }
}
