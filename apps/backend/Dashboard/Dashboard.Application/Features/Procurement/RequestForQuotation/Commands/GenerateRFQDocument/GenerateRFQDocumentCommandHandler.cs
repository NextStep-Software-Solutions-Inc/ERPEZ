using ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;
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

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.GenerateRFQDocument;

public class GenerateRFQDocumentCommandHandler(
    IUnitOfWork unitOfWork,
    IDocumentRendererService rendererService,
    IDocumentStorageService storageService,
    IConfiguration configuration)
    : IRequestHandler<GenerateRFQDocumentCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(GenerateRFQDocumentCommand request, CancellationToken cancellationToken)
    {
        var rfq = await unitOfWork.RFQRepository.GetRFQWithDetailsAsync(request.RFQId, cancellationToken);
        if (rfq == null)
        {
            throw new NotFoundException($"RFQ with ID '{request.RFQId}' was not found.");
        }

        var projectName = !string.IsNullOrWhiteSpace(rfq.Description)
            ? rfq.Description
            : (!string.IsNullOrWhiteSpace(rfq.Purpose) ? rfq.Purpose : "Procurement Project");

        var modeName = rfq.ModeOfProcurement?.Name
            ?? "Negotiated Procurement - Small Value Procurement - Section 53.9, Rule XVI, Revised IRR of RA 9184";

        var dateFormatted = rfq.Date != default
            ? rfq.Date.ToString("MMMM dd, yyyy")
            : DateTime.UtcNow.ToString("MMMM dd, yyyy");

        var deadlineFormatted = rfq.Deadline.HasValue
            ? rfq.Deadline.Value.ToString("dddd, MMMM dd, yyyy 'at 12:00 noon'")
            : "To be announced";

        var procuringEntity = configuration["Procurement:ProcuringEntityName"]
            ?? "University of Science and Technology of Southern Philippines";

        var submissionLocation = configuration["Procurement:SubmissionLocation"]
            ?? "Procurement Unit, 2nd Floor, USTP Gymnasium building";

        var contactEmail = configuration["Procurement:BacEmail"] ?? "bacsec@ustp.edu.ph";
        var contactPhone = configuration["Procurement:BacPhone"] ?? "856-1738 Local 1164";
        var bacChairpersonName = configuration["Procurement:BacChairpersonName"] ?? "ENGR. ALEX L. MAUREAL";
        var bacChairpersonTitle = configuration["Procurement:BacChairpersonTitle"] ?? "BAC IV CHAIRPERSON";
        var deliveryPeriod = !string.IsNullOrWhiteSpace(rfq.DeliveryPeriod)
            ? rfq.DeliveryPeriod
            : "15 CALENDAR DAY UPON RECEIPT OF Purchase Order.";

        // Resolve CPR / PR / BAC Resolution Numbers
        var prNumber = rfq.ConsolidatedPR?.CPRNumber ?? (!string.IsNullOrWhiteSpace(rfq.TracingNumber) ? rfq.TracingNumber : "2025-3540-18");
        var bacResNumber = "ALT-25-0524 s. 2025, ALT-25-0524a s. 2025";

        // Query bids submitted for this RFQ
        var bids = await unitOfWork.SupplierBidRepository.Query()
            .Include(b => b.Supplier)
            .Include(b => b.SupplierBidItems)
            .Where(b => b.RFQId == rfq.Id && !b.IsDeleted)
            .ToListAsync(cancellationToken);

        var rawRfqItems = (rfq.RFQItems ?? []).Where(i => !i.IsDeleted).ToList();
        var rfqItems = rawRfqItems
            .Select((item, idx) => new RfqItemDataDto
            {
                ItemNo = idx + 1,
                ItemName = item.ItemNameSnapshot,
                Specifications = item.CPRItem?.PRItem?.Description ?? item.ItemNameSnapshot,
                Quantity = item.Quantity,
                Unit = item.CPRItem?.PRItem?.PPMPItem?.Unit ?? "lot",
                ApprovedUnitCost = item.UnitPriceSnapshot,
                ApprovedTotalCost = item.Quantity * item.UnitPriceSnapshot
            })
            .ToList();

        var totalABC = rfqItems.Sum(i => i.ApprovedTotalCost);
        if (totalABC <= 0 && rfq.TotalAmount > 0)
        {
            totalABC = rfq.TotalAmount;
        }

        // Hydrate invited suppliers
        var suppliers = new List<RfqSupplierDataDto>();
        foreach (var rfqSupplier in (rfq.RFQSuppliers ?? []).Where(s => !s.IsDeleted))
        {
            var supplier = rfqSupplier.Supplier ?? await unitOfWork.SupplierRepository.GetByIdAsync(rfqSupplier.SupplierId, cancellationToken);
            if (supplier == null) continue;

            var matchingBid = bids.FirstOrDefault(b => b.SupplierId == supplier.Id);

            var quotedItems = rfqItems.Select(baseItem =>
            {
                var bidItem = matchingBid?.SupplierBidItems?.FirstOrDefault(bi =>
                    rawRfqItems.Any(ri => ri.Id == bi.RFQItemId && ri.ItemNameSnapshot == baseItem.ItemName));

                return new RfqItemDataDto
                {
                    ItemNo = baseItem.ItemNo,
                    ItemName = baseItem.ItemName,
                    Specifications = baseItem.Specifications,
                    Quantity = baseItem.Quantity,
                    Unit = baseItem.Unit,
                    ApprovedUnitCost = baseItem.ApprovedUnitCost,
                    ApprovedTotalCost = baseItem.ApprovedTotalCost,
                    QuotedUnitPrice = bidItem?.UnitPrice,
                    QuotedTotalCost = bidItem?.TotalPrice,
                    OfferedBrand = bidItem?.Brand,
                    OfferedModel = bidItem?.Model,
                    OfferedSpecifications = !string.IsNullOrWhiteSpace(bidItem?.Brand)
                        ? $"{bidItem.Brand} {bidItem.Model} {bidItem.Color}".Trim()
                        : null
                };
            }).ToList();

            suppliers.Add(new RfqSupplierDataDto
            {
                SupplierId = supplier.Id,
                SupplierName = supplier.Name,
                TradeName = supplier.Name,
                Address = supplier.Address ?? string.Empty,
                ContactPerson = supplier.ContactPerson ?? string.Empty,
                ContactNumber = supplier.ContactNumber ?? string.Empty,
                Email = supplier.Email ?? string.Empty,
                QuotedItems = quotedItems
            });
        }

        // If no invited suppliers recorded, add a generic placeholder sheet
        if (suppliers.Count == 0)
        {
            suppliers.Add(new RfqSupplierDataDto
            {
                SupplierName = "Prospective Bidder / Supplier",
                TradeName = "Prospective Bidder / Supplier",
                Address = "Cagayan de Oro City",
                QuotedItems = rfqItems
            });
        }

        var rfqData = new RfqDataDto
        {
            RFQId = rfq.Id,
            RFQNumber = rfq.RFQNumber,
            QuotationNo = rfq.RFQNumber,
            ProjectName = projectName,
            Date = dateFormatted,
            Deadline = deadlineFormatted,
            ModeOfProcurement = modeName,
            ApprovedBudgetForContract = totalABC,
            PRNumber = prNumber,
            BacResolutionNumber = bacResNumber,
            ProcuringEntity = procuringEntity,
            SubmissionLocation = submissionLocation,
            ContactEmail = contactEmail,
            ContactPhone = contactPhone,
            BacChairpersonName = bacChairpersonName,
            BacChairpersonTitle = bacChairpersonTitle,
            DeliveryPeriod = deliveryPeriod,
            Items = rfqItems,
            Suppliers = suppliers
        };

        // Render document
        var bytes = await rendererService.RenderAsync(
            rfqData, DocumentType.Rfq, request.Format, cancellationToken);

        // Save generated file
        var extension = request.Format == ExportFormat.Excel ? "xlsx" : "pdf";
        var fileName = $"RFQ_{rfq.RFQNumber}_{DateTime.UtcNow:yyyyMMddHHmmss}.{extension}";
        var storagePath = await storageService.SaveAsync(bytes, fileName, cancellationToken);

        // Resolve OfficeId
        Guid officeId = Guid.Empty;

        // 1. Try from RFQItems' CPRItem -> PurchaseRequest Office
        var prOfficeId = rfq.RFQItems?
            .Select(i => i.CPRItem?.PurchaseRequest?.OfficeId ?? i.CPRItem?.PRItem?.PurchaseRequest?.OfficeId)
            .FirstOrDefault(id => id.HasValue && id.Value != Guid.Empty);

        if (prOfficeId.HasValue)
        {
            officeId = prOfficeId.Value;
        }
        else
        {
            // 2. Try from ConsolidatedPRItems
            var cprOfficeId = rfq.ConsolidatedPR?.ConsolidatedPRItems?
                .Select(ci => ci.PurchaseRequest?.OfficeId)
                .FirstOrDefault(id => id.HasValue && id.Value != Guid.Empty);

            if (cprOfficeId.HasValue)
            {
                officeId = cprOfficeId.Value;
            }
        }

        // 3. Fallback to first available office in DB if still empty
        if (officeId == Guid.Empty)
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
            throw new InvalidOperationException("Cannot generate RFQ document because no valid Office could be associated with this document.");
        }

        var record = new GeneratedDocument
        {
            DocumentType = DocumentType.Rfq,
            Format = request.Format,
            OfficeId = officeId,
            SourceDocumentId = rfq.Id,
            StoragePath = storagePath,
            FileName = fileName,
            FileSizeBytes = bytes.Length,
            FiscalYear = DateTime.UtcNow.Year.ToString(),
            GeneratedBy = request.GeneratedBy
        };

        await unitOfWork.GeneratedDocumentRepository.AddAsync(record, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(record.Id, "RFQ document generated successfully.");
    }
}
