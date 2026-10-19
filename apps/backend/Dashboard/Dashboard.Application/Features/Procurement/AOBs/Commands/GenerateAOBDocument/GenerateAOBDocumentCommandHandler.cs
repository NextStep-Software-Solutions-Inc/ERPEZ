using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Common.Helpers;
using ERPEZ.Application.Features.Procurement.AOBs.Common;
using ERPEZ.Application.Features.Procurement.AOBs.Dtos;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.GenerateAOBDocument;

public class GenerateAOBDocumentCommandHandler(
    IUnitOfWork unitOfWork,
    IDocumentRendererService rendererService,
    IDocumentStorageService storageService,
    IRFQDocumentContextService rfqContextService,
    ILogger<GenerateAOBDocumentCommandHandler> logger)
    : IRequestHandler<GenerateAOBDocumentCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(GenerateAOBDocumentCommand request, CancellationToken cancellationToken)
    {
        var aob = await unitOfWork.AOBRepository.Query()
            .Include(a => a.AOBRFQMappings)
            .Include(a => a.AOBAwardedItems)
                .ThenInclude(ai => ai.WinningSupplier)
            .FirstOrDefaultAsync(a => a.Id == request.AOBId && !a.IsDeleted, cancellationToken);

        if (aob == null)
        {
            throw new NotFoundException($"Abstract of Bids with ID '{request.AOBId}' was not found.");
        }

        logger.LogInformation("Generating Abstract of Bids document for AOB {AOBNumber} (ID: {AOBId}) with format {Format}", aob.AOBNumber, aob.Id, request.Format);

        var rfqIds = aob.AOBRFQMappings.Select(m => m.RFQId).Distinct().ToList();

        // 1. Load Linked RFQs with their items and mode of procurement
        var rfqs = await unitOfWork.RFQRepository.Query()
            .Include(r => r.RFQItems)
                .ThenInclude(i => i.CPRItem)
                    .ThenInclude(ci => ci!.ConsolidatedPR)
            .Include(r => r.ModeOfProcurement)
            .Include(r => r.ConsolidatedPR)
                .ThenInclude(cpr => cpr!.ConsolidatedPRItems)
            .Where(r => rfqIds.Contains(r.Id))
            .ToListAsync(cancellationToken);

        var allRfqItems = rfqs.SelectMany(r => r.RFQItems).Where(i => !i.IsDeleted).ToList();

        // 2. Load Submitted Bids for these RFQs
        var bids = await unitOfWork.SupplierBidRepository.Query()
            .Include(sb => sb.Supplier)
            .Include(sb => sb.SupplierBidItems)
            .Where(sb => rfqIds.Contains(sb.RFQId) && !sb.IsDeleted && sb.Status != "Draft" && sb.Status != "Cancelled" && sb.Status != "Withdrawn")
            .ToListAsync(cancellationToken);

        // 3. Resolve office hierarchy from RFQ items
        Guid officeId = Guid.Empty;
        var primaryRfq = rfqs.FirstOrDefault();

        var prOfficeId = allRfqItems
            .Select(i => i.CPRItem?.PurchaseRequest?.OfficeId ?? i.CPRItem?.PRItem?.PurchaseRequest?.OfficeId)
            .FirstOrDefault(id => id.HasValue && id.Value != Guid.Empty);

        if (prOfficeId.HasValue)
        {
            officeId = prOfficeId.Value;
        }
        else
        {
            var defaultOffice = await unitOfWork.OfficeRepository.FindAsync(o => !o.IsDeleted, cancellationToken)
                ?? await unitOfWork.OfficeRepository.FindAsync(o => true, cancellationToken);
            if (defaultOffice != null)
            {
                officeId = defaultOffice.Id;
            }
        }

        if (officeId == Guid.Empty)
        {
            throw new InvalidOperationException("Cannot generate Abstract of Bids document because no valid Office could be associated.");
        }

        // 4. Resolve shared context (procuring entity, delivery location, BAC chairperson)
        var ctx = await rfqContextService.ResolveAsync(
            aob.AOBNumber,
            aob.Id,
            officeId,
            cancellationToken);

        // 5. Build dynamic metadata fields
        var projectName = !string.IsNullOrWhiteSpace(aob.Description)
            ? aob.Description.Trim()
            : (!string.IsNullOrWhiteSpace(primaryRfq?.Description) ? primaryRfq.Description.Trim() : "[PROJECT NAME]");

        var modeName = !string.IsNullOrWhiteSpace(primaryRfq?.ModeOfProcurement?.Name)
            ? primaryRfq.ModeOfProcurement.Name.Trim()
            : "Negotiated Procurement - Small Value Procurement - Section 53.9";

        var deliveryLocation = !string.IsNullOrWhiteSpace(ctx.DeliveryLocation)
            ? ctx.DeliveryLocation.Trim()
            : "[DELIVERY LOCATION]";

        var implementingOffice = !string.IsNullOrWhiteSpace(ctx.ProcuringEntity)
            ? ctx.ProcuringEntity.Trim()
            : "[IMPLEMENTING OFFICE]";

        // 6. Map Line Items with strict 1-based sequential counting numbers (1, 2, 3...)
        var aobItems = allRfqItems.Select((item, idx) =>
        {
            var awarded = aob.AOBAwardedItems.FirstOrDefault(ai => ai.RFQItemId == item.Id);
            return new AobItemDataDto
            {
                RFQItemId = item.Id,
                ItemNo = idx + 1, // Sequential counting number
                ItemName = item.ItemNameSnapshot?.Trim() ?? $"Item #{idx + 1}",
                Specifications = item.CPRItem?.PRItem?.Description?.Trim() ?? item.ItemNameSnapshot?.Trim() ?? string.Empty,
                Quantity = item.Quantity,
                Unit = "units",
                ApprovedUnitCost = item.UnitPriceSnapshot,
                ApprovedTotalCost = item.Quantity * item.UnitPriceSnapshot,
                AwardedSupplierId = awarded?.WinningSupplierId,
                AwardedSupplierName = awarded?.WinningSupplier?.Name,
                AwardedUnitPrice = awarded?.AwardedUnitPrice,
                AwardedTotalAmount = awarded?.TotalAwardedAmount
            };
        }).ToList();

        var totalABC = aobItems.Sum(i => i.ApprovedTotalCost);

        // 7. Map Suppliers and their Bids
        var distinctSuppliers = bids
            .GroupBy(b => b.SupplierId)
            .Select(g => g.First())
            .ToList();

        var aobSuppliers = new List<AobSupplierDataDto>();

        foreach (var sb in distinctSuppliers)
        {
            var supplier = sb.Supplier;
            if (supplier == null) continue;

            var supplierBidEntries = bids.Where(b => b.SupplierId == supplier.Id).ToList();

            var supplierBids = aobItems.Select(item =>
            {
                // Find matching bid item
                SupplierBidItem? matchingBidItem = null;
                SupplierBid? parentBid = null;

                foreach (var bid in supplierBidEntries)
                {
                    var found = bid.SupplierBidItems?.FirstOrDefault(bi => bi.RFQItemId == item.RFQItemId);
                    if (found != null)
                    {
                        matchingBidItem = found;
                        parentBid = bid;
                        break;
                    }
                }

                if (matchingBidItem == null || (matchingBidItem.UnitPrice <= 0 && matchingBidItem.TotalPrice <= 0))
                {
                    return new AobSupplierBidDataDto
                    {
                        RFQItemId = item.RFQItemId,
                        DidSubmit = false,
                        IsWinner = false
                    };
                }

                var unitPrice = matchingBidItem.UnitPrice;
                var totalPrice = matchingBidItem.TotalPrice > 0 ? matchingBidItem.TotalPrice : (unitPrice * item.Quantity);
                var isAwardedWinner = item.AwardedSupplierId.HasValue && item.AwardedSupplierId.Value == supplier.Id;

                return new AobSupplierBidDataDto
                {
                    RFQItemId = item.RFQItemId,
                    UnitPrice = unitPrice,
                    TotalPrice = totalPrice,
                    OfferedBrand = matchingBidItem.Brand?.Trim(),
                    OfferedModel = matchingBidItem.Model?.Trim(),
                    OfferedSpecifications = !string.IsNullOrWhiteSpace(matchingBidItem.Brand)
                        ? string.Join(" ", new[] { matchingBidItem.Brand?.Trim(), matchingBidItem.Model?.Trim(), matchingBidItem.Color?.Trim() }.Where(s => !string.IsNullOrWhiteSpace(s)))
                        : null,
                    OfferedRemarks = parentBid?.Remarks?.Trim(),
                    DeliveryPeriod = parentBid?.DeliveryPeriod?.Trim(),
                    DidSubmit = true,
                    IsWinner = isAwardedWinner
                };
            }).ToList();

            var totalQuotation = supplierBids.Where(b => b.DidSubmit && b.TotalPrice.HasValue).Sum(b => b.TotalPrice!.Value);
            var hasWonAnyItem = supplierBids.Any(b => b.IsWinner);

            aobSuppliers.Add(new AobSupplierDataDto
            {
                SupplierId = supplier.Id,
                SupplierName = supplier.Name?.Trim() ?? "[Supplier / Bidder Name]",
                Address = supplier.Address?.Trim() ?? "[ADDRESS / CONTACT]",
                ContactPerson = supplier.ContactPerson?.Trim() ?? string.Empty,
                ContactNumber = supplier.ContactNumber?.Trim() ?? string.Empty,
                Email = supplier.Email?.Trim() ?? string.Empty,
                TotalQuotation = totalQuotation,
                HasWonAnyItem = hasWonAnyItem,
                Bids = supplierBids
            });
        }

        // 8. Reference numbers, approvers, and 6-slot BAC Committee Signatories
        var metadata = await AOBReferenceResolver.ResolveAsync(
            unitOfWork, aob.Id, aob.ApprovedBy, rfqs, cancellationToken);

        var bacMembers = await DocumentSignatoryResolver
            .ResolveActiveBacMembersAsync(unitOfWork, cancellationToken);

        var chairMember = bacMembers.FirstOrDefault(m =>
            string.Equals(m.Role, "Chairperson", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(m.Role, "Chairman", StringComparison.OrdinalIgnoreCase));

        var viceChairMember = bacMembers.FirstOrDefault(m =>
            m.Role.Contains("Vice", StringComparison.OrdinalIgnoreCase));

        var regularMembers = bacMembers.Where(m =>
            !string.Equals(m.Role, "Chairperson", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(m.Role, "Chairman", StringComparison.OrdinalIgnoreCase) &&
            !m.Role.Contains("Vice", StringComparison.OrdinalIgnoreCase))
            .ToList();

        var regMember1 = regularMembers.ElementAtOrDefault(0);
        var regMember2 = regularMembers.ElementAtOrDefault(1);
        var regMember3 = regularMembers.ElementAtOrDefault(2);

        var signatories = new List<AobSignatoryDataDto>
        {
            new()
            {
                Name = !string.IsNullOrWhiteSpace(chairMember?.FullName) ? chairMember.FullName : ctx.BacChairpersonName,
                Title = !string.IsNullOrWhiteSpace(chairMember?.Position) ? chairMember.Position : ctx.BacChairpersonTitle,
                Role = "BAC Chairperson"
            },
            new()
            {
                Name = !string.IsNullOrWhiteSpace(viceChairMember?.FullName) ? viceChairMember.FullName : "[BAC VICE CHAIRPERSON]",
                Title = !string.IsNullOrWhiteSpace(viceChairMember?.Position) ? viceChairMember.Position : "BAC Vice Chairperson",
                Role = "BAC Vice Chairperson"
            },
            new()
            {
                Name = !string.IsNullOrWhiteSpace(regMember1?.FullName) ? regMember1.FullName : "[BAC REGULAR MEMBER]",
                Title = !string.IsNullOrWhiteSpace(regMember1?.Position) ? regMember1.Position : "BAC Regular Member",
                Role = "BAC Regular Member"
            },
            new()
            {
                Name = !string.IsNullOrWhiteSpace(regMember2?.FullName) ? regMember2.FullName : "[BAC REGULAR MEMBER]",
                Title = !string.IsNullOrWhiteSpace(regMember2?.Position) ? regMember2.Position : "BAC Regular Member",
                Role = "BAC Regular Member"
            },
            new()
            {
                Name = !string.IsNullOrWhiteSpace(metadata.EndUserRepName)
                    ? metadata.EndUserRepName
                    : (!string.IsNullOrWhiteSpace(regMember3?.FullName) ? regMember3.FullName : "[PROVISIONAL MEMBER]"),
                Title = "Provisional Member, End-user Rep",
                Role = "Provisional Member, End-user Rep"
            },
            new()
            {
                Name = !string.IsNullOrWhiteSpace(metadata.TechRepName) ? metadata.TechRepName : "[PROVISIONAL MEMBER]",
                Title = "Provisional Member, Tech Rep",
                Role = "Provisional Member, Tech Rep"
            }
        };

        var rfqNumber = !string.IsNullOrWhiteSpace(metadata.RFQNumber) ? metadata.RFQNumber : (primaryRfq?.RFQNumber ?? "[RFQ NUMBER]");
        var prNumber = !string.IsNullOrWhiteSpace(metadata.PRNumber) ? metadata.PRNumber : (primaryRfq?.ConsolidatedPR?.CPRNumber ?? "[PR NUMBER]");
        var bacResolutionNumber = !string.IsNullOrWhiteSpace(metadata.BacResolutionNumber) ? metadata.BacResolutionNumber : "[BAC RES. NO.]";
        var papCode = !string.IsNullOrWhiteSpace(metadata.PAPCode) ? metadata.PAPCode : "[PAP CODE]";
        var approverName = !string.IsNullOrWhiteSpace(metadata.ApproverName) ? metadata.ApproverName : "[HEAD OF PROCURING ENTITY / APPROVING AUTHORITY]";
        var approverTitle = !string.IsNullOrWhiteSpace(metadata.ApproverTitle) ? metadata.ApproverTitle : "[POSITION / DESIGNATION]";

        var aobData = new AobDataDto
        {
            AOBId = aob.Id,
            AOBNumber = aob.AOBNumber,
            ProjectName = projectName,
            ModeOfProcurement = modeName,
            DeliveryLocation = deliveryLocation,
            ImplementingOffice = implementingOffice,
            ApprovedTotalCost = totalABC,
            Items = aobItems,
            Suppliers = aobSuppliers,
            Signatories = signatories,
            ApprovedByName = approverName,
            ApproverTitle = approverTitle,
            RFQNumber = rfqNumber,
            BacResolutionNumber = bacResolutionNumber,
            PRNumber = prNumber,
            PAPCode = papCode
        };

        // 9. Render document via QuestPDF service
        var bytes = await rendererService.RenderAsync(
            aobData, DocumentType.Aob, request.Format, cancellationToken);

        // 10. Save generated file to storage
        var extension = request.Format == ExportFormat.Excel ? "xlsx" : "pdf";
        var fileName = $"Abstract_of_Quotation_{aob.AOBNumber}_{DateTime.UtcNow:yyyyMMddHHmmss}.{extension}";
        var storagePath = await storageService.SaveAsync(bytes, fileName, cancellationToken);

        var record = new GeneratedDocument
        {
            DocumentType = DocumentType.Aob,
            Format = request.Format,
            OfficeId = officeId,
            SourceDocumentId = aob.Id,
            StoragePath = storagePath,
            FileName = fileName,
            FileSizeBytes = bytes.Length,
            FiscalYear = DateTime.UtcNow.Year.ToString(),
            GeneratedBy = !string.IsNullOrWhiteSpace(request.GeneratedBy) ? request.GeneratedBy.Trim() : "system"
        };

        await unitOfWork.GeneratedDocumentRepository.AddAsync(record, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(record.Id, "Abstract of Bids document generated successfully.");
    }
}
