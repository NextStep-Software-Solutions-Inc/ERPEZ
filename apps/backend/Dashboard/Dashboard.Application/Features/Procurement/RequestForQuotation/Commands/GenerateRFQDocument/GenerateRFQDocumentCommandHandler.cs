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
using Microsoft.Extensions.Logging;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.GenerateRFQDocument;

public class GenerateRFQDocumentCommandHandler(
    IUnitOfWork unitOfWork,
    IDocumentRendererService rendererService,
    IDocumentStorageService storageService,
    IConfiguration configuration,
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

        // 2. Resolve Main Organization or Head Office for document header
        string? mainOrgOrHeadOfficeName = null;
        string? mainOrgOrHeadOfficeAddress = null;

        var currentOffice = await unitOfWork.OfficeRepository.GetByIdWithDetailsAsync(officeId, cancellationToken);
        if (currentOffice != null)
        {
            while (currentOffice.ParentId.HasValue && currentOffice.ParentId.Value != Guid.Empty)
            {
                var parentOffice = await unitOfWork.OfficeRepository.GetByIdWithDetailsAsync(currentOffice.ParentId.Value, cancellationToken);
                if (parentOffice == null) break;
                currentOffice = parentOffice;
            }

            if (currentOffice.Organization != null && !string.IsNullOrWhiteSpace(currentOffice.Organization.Name))
            {
                mainOrgOrHeadOfficeName = currentOffice.Organization.Name;
            }
            else if (!string.IsNullOrWhiteSpace(currentOffice.Name))
            {
                mainOrgOrHeadOfficeName = currentOffice.Name;
            }

            if (!string.IsNullOrWhiteSpace(currentOffice.Address))
            {
                mainOrgOrHeadOfficeAddress = currentOffice.Address;
            }
        }

        if (string.IsNullOrWhiteSpace(mainOrgOrHeadOfficeName))
        {
            var topOrg = await unitOfWork.OrganizationRepository.FindAsync(o => o.ParentId == null && !o.IsDeleted, cancellationToken)
                ?? await unitOfWork.OrganizationRepository.FindAsync(o => !o.IsDeleted, cancellationToken);

            if (topOrg != null && !string.IsNullOrWhiteSpace(topOrg.Name))
            {
                mainOrgOrHeadOfficeName = topOrg.Name;
            }
        }

        if (string.IsNullOrWhiteSpace(mainOrgOrHeadOfficeName))
        {
            var rootOffice = await unitOfWork.OfficeRepository.FindAsync(o => o.ParentId == null && !o.IsDeleted, cancellationToken);
            if (rootOffice != null && !string.IsNullOrWhiteSpace(rootOffice.Name))
            {
                mainOrgOrHeadOfficeName = rootOffice.Name;
                if (!string.IsNullOrWhiteSpace(rootOffice.Address))
                {
                    mainOrgOrHeadOfficeAddress = rootOffice.Address;
                }
            }
        }

        if (string.IsNullOrWhiteSpace(mainOrgOrHeadOfficeName))
        {
            mainOrgOrHeadOfficeName = configuration["Procurement:ProcuringEntityName"]
                ?? configuration["Procurement:OrganizationName"]
                ?? configuration["Procurement:HeadOfficeName"];
        }

        if (string.IsNullOrWhiteSpace(mainOrgOrHeadOfficeName))
        {
            logger.LogWarning(
                "RFQ {RFQNumber} (ID: {RFQId}) could not resolve Head Office / Procuring Entity name from office hierarchy, database organizations, or configuration ('Procurement:ProcuringEntityName'). Falling back to placeholder '{Placeholder}'.",
                rfq.RFQNumber, rfq.Id, "[Head Office / Procuring Entity]");
        }

        var procuringEntity = !string.IsNullOrWhiteSpace(mainOrgOrHeadOfficeName)
            ? mainOrgOrHeadOfficeName
            : "[Head Office / Procuring Entity]";

        if (string.IsNullOrWhiteSpace(mainOrgOrHeadOfficeAddress) && string.IsNullOrWhiteSpace(configuration["Procurement:ProcuringEntityAddress"]))
        {
            logger.LogWarning(
                "RFQ {RFQNumber} (ID: {RFQId}) could not resolve Procuring Entity address from office hierarchy or configuration ('Procurement:ProcuringEntityAddress').",
                rfq.RFQNumber, rfq.Id);
        }

        var procuringEntityAddress = !string.IsNullOrWhiteSpace(mainOrgOrHeadOfficeAddress)
            ? mainOrgOrHeadOfficeAddress
            : (configuration["Procurement:ProcuringEntityAddress"] ?? string.Empty);

        // 3. Resolve live BAC Members or placeholders
        var bacChairperson = await unitOfWork.BACMemberRepository.FindAsync(
            m => m.IsActive && !m.IsDeleted && (m.Role == "Chairperson" || m.Role.Contains("Chair")),
            cancellationToken);

        var bacSecretariat = await unitOfWork.BACMemberRepository.FindAsync(
            m => m.IsActive && !m.IsDeleted && (m.Role.Contains("Sec") || m.Position.Contains("Sec")),
            cancellationToken);

        if (bacChairperson == null && string.IsNullOrWhiteSpace(configuration["Procurement:BacChairpersonName"]))
        {
            logger.LogWarning(
                "RFQ {RFQNumber} (ID: {RFQId}) could not find an active BAC Chairperson in database or configuration ('Procurement:BacChairpersonName'). Falling back to placeholder '{Placeholder}'.",
                rfq.RFQNumber, rfq.Id, "[BAC Chairperson / Secretariat Name]");
        }

        var bacChairpersonName = bacChairperson?.FullName
            ?? configuration["Procurement:BacChairpersonName"]
            ?? "[BAC Chairperson / Secretariat Name]";

        if (string.IsNullOrWhiteSpace(bacChairperson?.Position) && string.IsNullOrWhiteSpace(configuration["Procurement:BacChairpersonTitle"]))
        {
            logger.LogWarning(
                "RFQ {RFQNumber} (ID: {RFQId}) could not resolve BAC Chairperson designation/title from database or configuration ('Procurement:BacChairpersonTitle'). Falling back to placeholder '{Placeholder}'.",
                rfq.RFQNumber, rfq.Id, "[BAC Chairperson / Secretariat Designation]");
        }

        var bacChairpersonTitle = (!string.IsNullOrWhiteSpace(bacChairperson?.Position) ? bacChairperson.Position : null)
            ?? configuration["Procurement:BacChairpersonTitle"]
            ?? "[BAC Chairperson / Secretariat Designation]";

        if (bacSecretariat == null && string.IsNullOrWhiteSpace(configuration["Procurement:BacSecName"]))
        {
            logger.LogWarning(
                "RFQ {RFQNumber} (ID: {RFQId}) could not find an active BAC Secretariat in database or configuration ('Procurement:BacSecName'). Falling back to placeholder '{Placeholder}'.",
                rfq.RFQNumber, rfq.Id, "[BAC Secretariat]");
        }

        var bacSecName = bacSecretariat?.FullName
            ?? configuration["Procurement:BacSecName"]
            ?? "[BAC Secretariat]";

        // 4. Resolve dynamic fields without hardcoded sample fallbacks
        var projectName = !string.IsNullOrWhiteSpace(rfq.Description)
            ? rfq.Description
            : (!string.IsNullOrWhiteSpace(rfq.Purpose) ? rfq.Purpose : "[Project Name / Purpose]");

        var modeName = rfq.ModeOfProcurement?.Name
            ?? "[Mode of Procurement]";

        var dateFormatted = rfq.Date != default
            ? rfq.Date.ToString("MMMM dd, yyyy")
            : DateTime.UtcNow.ToString("MMMM dd, yyyy");

        var deadlineFormatted = rfq.Deadline.HasValue
            ? rfq.Deadline.Value.ToString("dddd, MMMM dd, yyyy 'at 12:00 noon'")
            : "[Deadline Date]";

        if (string.IsNullOrWhiteSpace(configuration["Procurement:SubmissionLocation"]) && string.IsNullOrWhiteSpace(procuringEntityAddress))
        {
            logger.LogWarning(
                "RFQ {RFQNumber} (ID: {RFQId}) missing configuration for 'Procurement:SubmissionLocation' and no entity address available. Falling back to placeholder '{Placeholder}'.",
                rfq.RFQNumber, rfq.Id, "[Submission Location]");
        }

        var submissionLocation = configuration["Procurement:SubmissionLocation"]
            ?? (!string.IsNullOrWhiteSpace(procuringEntityAddress) ? procuringEntityAddress : "[Submission Location]");

        if (string.IsNullOrWhiteSpace(configuration["Procurement:DeliveryLocation"]) && string.IsNullOrWhiteSpace(procuringEntityAddress))
        {
            logger.LogWarning(
                "RFQ {RFQNumber} (ID: {RFQId}) missing configuration for 'Procurement:DeliveryLocation' and no entity address available. Falling back to placeholder '{Placeholder}'.",
                rfq.RFQNumber, rfq.Id, "[Delivery Location]");
        }

        var deliveryLocation = configuration["Procurement:DeliveryLocation"]
            ?? (!string.IsNullOrWhiteSpace(procuringEntityAddress) ? procuringEntityAddress : "[Delivery Location]");

        if (string.IsNullOrWhiteSpace(configuration["Procurement:BacEmail"]))
        {
            logger.LogWarning(
                "RFQ {RFQNumber} (ID: {RFQId}) missing configuration for 'Procurement:BacEmail'. Falling back to placeholder '{Placeholder}'.",
                rfq.RFQNumber, rfq.Id, "[BAC Email Address]");
        }

        var contactEmail = configuration["Procurement:BacEmail"]
            ?? "[BAC Email Address]";

        if (string.IsNullOrWhiteSpace(configuration["Procurement:BacPhone"]))
        {
            logger.LogWarning(
                "RFQ {RFQNumber} (ID: {RFQId}) missing configuration for 'Procurement:BacPhone'. Falling back to placeholder '{Placeholder}'.",
                rfq.RFQNumber, rfq.Id, "[BAC Contact Number]");
        }

        var contactPhone = configuration["Procurement:BacPhone"]
            ?? "[BAC Contact Number]";

        var deliveryPeriod = !string.IsNullOrWhiteSpace(rfq.DeliveryPeriod)
            ? rfq.DeliveryPeriod
            : "[Delivery Period]";

        var prNumber = rfq.ConsolidatedPR?.CPRNumber
            ?? (!string.IsNullOrWhiteSpace(rfq.TracingNumber) ? rfq.TracingNumber : "[PR / Tracing No.]");

        var bacResNumber = "[BAC Resolution No.]";

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
            ProcuringEntity = procuringEntity,
            ProcuringEntityAddress = procuringEntityAddress,
            SubmissionLocation = submissionLocation,
            DeliveryLocation = deliveryLocation,
            ContactEmail = contactEmail,
            ContactPhone = contactPhone,
            BacChairpersonName = bacChairpersonName,
            BacChairpersonTitle = bacChairpersonTitle,
            BacSecName = bacSecName,
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
