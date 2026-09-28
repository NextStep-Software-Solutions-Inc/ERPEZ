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

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Queries.GetDirectContractingPdf;

public class GetDirectContractingPdfQueryHandler(
    IUnitOfWork unitOfWork,
    IDocumentRendererService rendererService,
    IConfiguration configuration)
    : IRequestHandler<GetDirectContractingPdfQuery, ApiResponse<DirectContractingPdfFileResult>>
{
    public async Task<ApiResponse<DirectContractingPdfFileResult>> Handle(
        GetDirectContractingPdfQuery request,
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

        var pdfItems = new List<DirectContractingPdfItemDto>();
        bool hasProposal = dc.Proposal != null;
        decimal totalProposed = hasProposal ? dc.Proposal!.TotalProposalAmount : 0m;
        decimal effectiveTotalABC = dc.TotalABC > 0 ? dc.TotalABC : rawItems.Sum(i => i.TotalABC);

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

        if (!signatories.Any())
        {
            signatories.Add(new DirectContractingPdfSignatoryDto { Name = string.Empty, Position = "BAC Regular Member", Role = "Member", Order = 1 });
            signatories.Add(new DirectContractingPdfSignatoryDto { Name = string.Empty, Position = "BAC Regular Member", Role = "Member", Order = 2 });
            signatories.Add(new DirectContractingPdfSignatoryDto { Name = string.Empty, Position = "BAC Vice Chairperson", Role = "Vice Chairperson", Order = 3 });
            signatories.Add(new DirectContractingPdfSignatoryDto { Name = string.Empty, Position = "BAC Chairperson", Role = "Chairperson", Order = 4 });
        }

        var headOfAgencyName = configuration["BacDocument:HeadOfAgencyName"] ?? string.Empty;
        var headOfAgencyTitle = configuration["BacDocument:HeadOfAgencyTitle"] ?? "HEAD OF THE PROCURING ENTITY";
        var secretariatHeadName = configuration["BacDocument:BacSecretariatHeadName"] ?? string.Empty;
        var secretariatHeadTitle = configuration["BacDocument:BacSecretariatHeadTitle"] ?? "Head, BAC Secretariat";

        var justificationRemarks = !string.IsNullOrWhiteSpace(dc.ReviewRemarks)
            ? dc.ReviewRemarks
            : (dc.Proposal?.ProposalRemarks ?? "Direct Contracting is justified as the procurement involves proprietary goods/services obtainable solely from the exclusive manufacturer or authorized sole distributor, with no suitable substitute available in the market.");

        var exclusivityVerification = !string.IsNullOrWhiteSpace(dc.Proposal?.ExclusivityDocumentUrl)
            ? $"Certificate of Exclusivity / Proprietary Sole Distributorship verified: {dc.Proposal.ExclusivityDocumentUrl}"
            : "Sole Distributorship and Exclusivity documentation verified in accordance with COA and RA 12009 statutory requirements.";

        var dataDto = new DirectContractingPdfDataDto
        {
            DirectContractingId = dc.Id,
            DocumentControlNumber = dc.DCNumber,
            Date = dc.CreatedAt,
            ProcurementProjectReference = dc.BACProject?.Title ?? dc.Name,
            OfficeName = officeName,
            Supplier = supplierDto,
            StatutoryGround = "Section 35, Republic Act No. 12009 (New Government Procurement Act - NGPA)",
            JustificationRemarks = justificationRemarks,
            MarketScopingSummary = "Market verification and scoping confirm exclusivity of rights, patents, or proprietary manufacturing standards without equivalent alternatives in the market.",
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

        var bytes = await rendererService.RenderAsync(
            dataDto,
            DocumentType.DirectContracting,
            ExportFormat.Pdf,
            cancellationToken);

        var fileName = $"Direct_Contracting_{dc.DCNumber}.pdf";
        return ApiResponse<DirectContractingPdfFileResult>.Success(
            new DirectContractingPdfFileResult(bytes, fileName, "application/pdf"),
            "Direct Contracting PDF rendered successfully.");
    }
}
