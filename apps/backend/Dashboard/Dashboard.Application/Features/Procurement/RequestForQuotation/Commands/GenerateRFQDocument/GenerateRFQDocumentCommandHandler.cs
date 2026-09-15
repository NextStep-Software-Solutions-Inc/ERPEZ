using ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;
using ERPEZ.Application.Interfaces.Services;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.Extensions.Logging;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.GenerateRFQDocument;

public class GenerateRFQDocumentCommandHandler(
    IUnitOfWork unitOfWork,
    IDocumentRendererService rendererService,
    IDocumentStorageService storageService,
    IRFQDocumentContextService rfqContextService,
    ILogger<GenerateRFQDocumentCommandHandler> logger)
    : IRequestHandler<GenerateRFQDocumentCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(GenerateRFQDocumentCommand request, CancellationToken cancellationToken)
    {
        var rfq = await unitOfWork.RFQRepository.GetRFQWithDetailsAsync(request.RFQId, cancellationToken);
        if (rfq == null)
        {
            throw new NotFoundException($"RFQ with ID '{request.RFQId}' was not found.");
        }

        // 1. Resolve OfficeId from sourcing hierarchy
        Guid officeId = Guid.Empty;

        var prOfficeId = rfq.RFQItems?
            .Select(i => i.CPRItem?.PurchaseRequest?.OfficeId ?? i.CPRItem?.PRItem?.PurchaseRequest?.OfficeId)
            .FirstOrDefault(id => id.HasValue && id.Value != Guid.Empty);

        if (prOfficeId.HasValue)
        {
            officeId = prOfficeId.Value;
        }
        else
        {
            var cprOfficeId = rfq.ConsolidatedPR?.ConsolidatedPRItems?
                .Select(ci => ci.PurchaseRequest?.OfficeId)
                .FirstOrDefault(id => id.HasValue && id.Value != Guid.Empty);

            if (cprOfficeId.HasValue)
            {
                officeId = cprOfficeId.Value;
            }
        }

        if (officeId == Guid.Empty)
        {
            var defaultOffice = await unitOfWork.OfficeRepository.FindAsync(o => !o.IsDeleted, cancellationToken)
                ?? await unitOfWork.OfficeRepository.FindAsync(o => true, cancellationToken);
            if (defaultOffice != null)
            {
                officeId = defaultOffice.Id;
                logger.LogWarning(
                    "RFQ {RFQNumber} (ID: {RFQId}) items do not specify an originating Purchase Request office; falling back to active database office {OfficeId}.",
                    rfq.RFQNumber, rfq.Id, officeId);
            }
        }

        if (officeId == Guid.Empty)
        {
            throw new InvalidOperationException("Cannot generate RFQ document because no valid Office could be associated with this document.");
        }

        // 2. Delegate all shared context resolution (procuring entity, BAC signatories, contact details)
        //    to the dedicated service — keeping this handler DRY with GetRFQNoticeQueryHandler.
        var ctx = await rfqContextService.ResolveAsync(rfq.RFQNumber, rfq.Id, officeId, cancellationToken);

        // 3. Resolve dynamic RFQ fields
        var projectName = !string.IsNullOrWhiteSpace(rfq.Description)
            ? rfq.Description.Trim()
            : (!string.IsNullOrWhiteSpace(rfq.Purpose) ? rfq.Purpose.Trim() : "[Project Name / Purpose]");

        var modeName = !string.IsNullOrWhiteSpace(rfq.ModeOfProcurement?.Name)
            ? rfq.ModeOfProcurement.Name.Trim()
            : "[Mode of Procurement]";

        var dateFormatted = rfq.Date != default
            ? rfq.Date.ToString("MMMM dd, yyyy")
            : DateTime.UtcNow.ToString("MMMM dd, yyyy");

        var deadlineFormatted = rfq.Deadline.HasValue
            ? rfq.Deadline.Value.ToString("dddd, MMMM dd, yyyy 'at 12:00 noon'")
            : "[Deadline Date]";

        var deliveryPeriod = !string.IsNullOrWhiteSpace(rfq.DeliveryPeriod)
            ? rfq.DeliveryPeriod.Trim()
            : "[Delivery Period]";

        var prNumber = !string.IsNullOrWhiteSpace(rfq.ConsolidatedPR?.CPRNumber)
            ? rfq.ConsolidatedPR.CPRNumber.Trim()
            : (!string.IsNullOrWhiteSpace(rfq.TracingNumber) ? rfq.TracingNumber.Trim() : "[PR / Tracing No.]");

        var bacResNumber = "[BAC Resolution No.]";

        // Query bids submitted for this RFQ
        var bids = await unitOfWork.SupplierBidRepository.GetByRFQIdAsync(rfq.Id, cancellationToken);


        var rawRfqItems = (rfq.RFQItems ?? []).Where(i => !i.IsDeleted).ToList();
        var rfqItems = rawRfqItems
            .Select((item, idx) => new RfqItemDataDto
            {
                ItemNo = idx + 1,
                ItemName = item.ItemNameSnapshot?.Trim() ?? string.Empty,
                Specifications = item.CPRItem?.PRItem?.Description?.Trim() ?? item.ItemNameSnapshot?.Trim() ?? string.Empty,
                Quantity = item.Quantity,
                Unit = item.CPRItem?.PRItem?.PPMPItem?.Unit?.Trim() ?? "lot",
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
                    rawRfqItems.Any(ri => ri.Id == bi.RFQItemId && string.Equals(ri.ItemNameSnapshot?.Trim(), baseItem.ItemName?.Trim(), StringComparison.OrdinalIgnoreCase)));

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
                    OfferedBrand = bidItem?.Brand?.Trim(),
                    OfferedModel = bidItem?.Model?.Trim(),
                    OfferedSpecifications = !string.IsNullOrWhiteSpace(bidItem?.Brand)
                        ? string.Join(" ", new[] { bidItem.Brand?.Trim(), bidItem.Model?.Trim(), bidItem.Color?.Trim() }.Where(s => !string.IsNullOrWhiteSpace(s)))
                        : null
                };
            }).ToList();

            suppliers.Add(new RfqSupplierDataDto
            {
                SupplierId = supplier.Id,
                SupplierName = supplier.Name?.Trim() ?? "[Supplier / Bidder Name]",
                TradeName = supplier.Name?.Trim() ?? "[Business / Store Name]",
                Address = supplier.Address?.Trim() ?? string.Empty,
                ContactPerson = supplier.ContactPerson?.Trim() ?? string.Empty,
                ContactNumber = supplier.ContactNumber?.Trim() ?? string.Empty,
                Email = supplier.Email?.Trim() ?? string.Empty,
                QuotedItems = quotedItems
            });
        }

        // If no invited suppliers recorded, add a generic placeholder sheet
        if (suppliers.Count == 0)
        {
            suppliers.Add(new RfqSupplierDataDto
            {
                SupplierName = "[Supplier / Bidder Name]",
                TradeName = "[Business / Store Name]",
                Address = "[Supplier Address]",
                ContactPerson = "[Contact Person]",
                ContactNumber = "[Contact Number]",
                Email = "[Supplier Email]",
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
            ProcuringEntity = ctx.ProcuringEntity,
            ProcuringEntityAddress = ctx.ProcuringEntityAddress,
            SubmissionLocation = ctx.SubmissionLocation,
            DeliveryLocation = ctx.DeliveryLocation,
            ContactEmail = ctx.ContactEmail,
            ContactPhone = ctx.ContactPhone,
            BacChairpersonName = ctx.BacChairpersonName,
            BacChairpersonTitle = ctx.BacChairpersonTitle,
            BacSecName = ctx.BacSecName,
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

        string generatedByInfo = !string.IsNullOrWhiteSpace(request.GeneratedBy) ? request.GeneratedBy.Trim() : "system";
        if (!string.IsNullOrWhiteSpace(request.GeneratedBy) && !string.Equals(request.GeneratedBy, "system", StringComparison.OrdinalIgnoreCase))
        {
            // Resolve user via domain interface methods — no EF dependency in Application layer
            var generatedByValue = request.GeneratedBy.Trim();
            var user = await unitOfWork.UserRepository.GetByExternalIdentityIdAsync(generatedByValue, cancellationToken)
                ?? await unitOfWork.UserRepository.GetByUsernameAsync(generatedByValue, cancellationToken)
                ?? await unitOfWork.UserRepository.GetByEmailAsync(generatedByValue, cancellationToken);

            if (user != null && !string.IsNullOrWhiteSpace(user.FullName))
            {
                // PersonnelPositions may already be loaded (GetByExternalIdentityIdAsync includes them);
                // otherwise fall back to a separate repository call.
                var activePos = user.PersonnelPositions
                    .Where(pp => pp.IsActive && !pp.IsDeleted)
                    .FirstOrDefault()?.Position;

                if (activePos == null)
                {
                    var positions = await unitOfWork.PersonnelPositionRepository.GetByUserIdAsync(user.Id, cancellationToken);
                    activePos = positions.FirstOrDefault()?.Position;
                }

                var posTitle = activePos?.FunctionalTitle?.Trim() ?? activePos?.Title?.Trim();
                generatedByInfo = !string.IsNullOrWhiteSpace(posTitle)
                    ? $"{user.FullName.Trim()} ({posTitle})"
                    : user.FullName.Trim();
            }
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
            GeneratedBy = generatedByInfo
        };

        await unitOfWork.GeneratedDocumentRepository.AddAsync(record, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(record.Id, "RFQ document generated successfully.");
    }
}
