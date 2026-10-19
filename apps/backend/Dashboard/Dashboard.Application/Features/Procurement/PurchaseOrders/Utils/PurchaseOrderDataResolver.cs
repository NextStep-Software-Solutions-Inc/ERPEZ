using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Common.Helpers;
using ERPEZ.Application.Features.Procurement.PurchaseOrders.DTOs;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;

namespace ERPEZ.Application.Features.Procurement.PurchaseOrders.Utils;

public static class PurchaseOrderDataResolver
{
    public static async Task<PurchaseOrderDataDto> ResolveDataDtoAsync(
        PurchaseOrder purchaseOrder,
        IUnitOfWork unitOfWork,
        CancellationToken cancellationToken = default)
    {
        // 1. Resolve source document number
        string sourceDocNumber = string.Empty;
        if (purchaseOrder.SourceDocumentType == SourceDocumentTypeEnum.AOB)
        {
            var aob = await unitOfWork.AOBRepository.FindAsync(a => a.Id == purchaseOrder.SourceDocumentId, cancellationToken);
            sourceDocNumber = aob?.AOBNumber ?? string.Empty;
        }
        else if (purchaseOrder.SourceDocumentType == SourceDocumentTypeEnum.NOA)
        {
            var noa = await unitOfWork.NoticeOfAwardRepository.FindAsync(n => n.Id == purchaseOrder.SourceDocumentId, cancellationToken);
            sourceDocNumber = noa?.NOANumber ?? string.Empty;
        }
        else if (purchaseOrder.SourceDocumentType == SourceDocumentTypeEnum.BAC_RESOLUTION)
        {
            var da = await unitOfWork.DirectAcquisitionRepository.GetByIdWithConsolidatedPRAsync(purchaseOrder.SourceDocumentId, cancellationToken);
            sourceDocNumber = !string.IsNullOrWhiteSpace(da?.DANumber)
                ? da.DANumber
                : (da?.ConsolidatedPR?.CPRNumber ?? purchaseOrder.SourceDocumentId.ToString());
        }

        // 2. Resolve procuring entity name, address, and logo from Agency letterhead or database fallback
        var agency = await unitOfWork.AgencyRepository.FindAsync(a => !a.IsDeleted, cancellationToken);

        var topOrg = await unitOfWork.OrganizationRepository.FindAsync(o => o.ParentId == null && !o.IsDeleted, cancellationToken)
            ?? await unitOfWork.OrganizationRepository.FindAsync(o => !o.IsDeleted, cancellationToken);

        var rootOffice = await unitOfWork.OfficeRepository.FindAsync(o => o.ParentId == null && !o.IsDeleted, cancellationToken)
            ?? await unitOfWork.OfficeRepository.FindAsync(o => !o.IsDeleted, cancellationToken);

        var candidate = topOrg?.Name?.Trim()
            ?? (rootOffice?.Organization != null ? rootOffice.Organization.Name?.Trim() : null)
            ?? (rootOffice != null && !string.IsNullOrWhiteSpace(rootOffice.Name) ? rootOffice.Name.Trim() : null)
            ?? string.Empty;

        // Never use 'SuperAdmin Workspace' or sample 'USTP'
        string fallbackEntityName = !string.IsNullOrWhiteSpace(candidate) &&
                                     !candidate.Equals("USTP", StringComparison.OrdinalIgnoreCase) &&
                                     !candidate.Contains("SuperAdmin", StringComparison.OrdinalIgnoreCase) &&
                                     !candidate.Contains("Workspace", StringComparison.OrdinalIgnoreCase)
            ? candidate
            : "Agency Name";

        string procuringEntityName = agency != null && !string.IsNullOrWhiteSpace(agency.Name)
            ? agency.Name.Trim()
            : fallbackEntityName;

        string? procuringEntityAddress = !string.IsNullOrWhiteSpace(agency?.Address)
            ? agency.Address.Trim()
            : null;

        byte[]? logoBytes = agency?.LogoImage;

        string procuringEntityOffice = rootOffice != null &&
                                       !string.IsNullOrWhiteSpace(rootOffice.Name) &&
                                       !string.Equals(rootOffice.Name.Trim(), procuringEntityName, StringComparison.OrdinalIgnoreCase) &&
                                       !rootOffice.Name.Contains("SuperAdmin", StringComparison.OrdinalIgnoreCase)
            ? rootOffice.Name.Trim()
            : string.Empty;

        // 3. Map procurement mode
        string modeStr = purchaseOrder.ProcurementMode switch
        {
            POProcurementModeEnum.SVP => "Negotiated Procurement - Small Value Procurement (Sec. 53.9)",
            POProcurementModeEnum.PUBLIC_BIDDING => "Competitive Public Bidding (Sec. 10)",
            POProcurementModeEnum.DIRECT_ACQUISITION => "Direct Acquisition / Direct Contracting (Sec. 50)",
            _ => purchaseOrder.ProcurementMode.ToString()
        };

        string typeOfPo = purchaseOrder.ProcurementMode switch
        {
            POProcurementModeEnum.SVP => "SVP",
            POProcurementModeEnum.PUBLIC_BIDDING => "Public Bidding",
            POProcurementModeEnum.DIRECT_ACQUISITION => "Direct Acquisition",
            _ => purchaseOrder.ProcurementMode.ToString()
        };

        var supplier = purchaseOrder.Supplier;
        var totalAmount = purchaseOrder.TotalAmount > 0
            ? purchaseOrder.TotalAmount
            : (purchaseOrder.PurchaseOrderItems?.Sum(i => i.Amount) ?? 0m);

        var amountInWords = PhilippineCurrencyWordsHelper.ToPhilippinePesoWords(totalAmount);

        var items = purchaseOrder.PurchaseOrderItems?
            .Select((i, idx) => new PurchaseOrderItemDataDto
            {
                ItemNumber = idx + 1,
                StockNo = (idx + 1).ToString(),
                Unit = !string.IsNullOrWhiteSpace(i.Unit) ? i.Unit : "unit",
                Description = !string.IsNullOrWhiteSpace(i.Description) ? i.Description : "Procurement Item",
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice,
                Amount = i.Amount > 0 ? i.Amount : (i.Quantity * i.UnitPrice)
            }).ToList() ?? [];

        return new PurchaseOrderDataDto
        {
            Id = purchaseOrder.Id,
            PONumber = purchaseOrder.PONumber,
            Date = purchaseOrder.Date.ToDateTime(TimeOnly.MinValue),
            ProcurementMode = modeStr,
            TypeOfPO = typeOfPo,
            SourceDocumentType = purchaseOrder.SourceDocumentType.ToString(),
            SourceDocumentNumber = sourceDocNumber,

            ProcuringEntityName = procuringEntityName,
            ProcuringEntityOffice = procuringEntityOffice,
            ProcuringEntityAddress = procuringEntityAddress,
            LogoBytes = logoBytes,

            SupplierId = purchaseOrder.SupplierId,
            SupplierName = supplier?.Name ?? "Winning Supplier",
            SupplierAddress = !string.IsNullOrWhiteSpace(supplier?.Address) ? supplier.Address : "Philippines",
            SupplierTIN = supplier?.TINNumber ?? string.Empty,

            PlaceOfDelivery = purchaseOrder.PlaceOfDelivery ?? string.Empty,
            DateOfDelivery = purchaseOrder.DateOfDelivery.HasValue ? purchaseOrder.DateOfDelivery.Value.ToDateTime(TimeOnly.MinValue) : null,
            DeliveryTerm = purchaseOrder.DeliveryTerm ?? string.Empty,
            PaymentTerm = purchaseOrder.PaymentTerm ?? string.Empty,

            TotalAmount = totalAmount,
            AmountInWords = amountInWords,

            ApprovedByName = string.Empty,
            ApprovedByPosition = "Head of the Procuring Entity",
            ApprovedAt = purchaseOrder.ApprovedAt,

            Items = items
        };
    }
}
