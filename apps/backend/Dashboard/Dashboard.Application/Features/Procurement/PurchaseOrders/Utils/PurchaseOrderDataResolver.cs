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
        // 1. Resolve source document number (and optional source approver)
        string sourceDocNumber = string.Empty;
        string? sourceApproverName = null;
        Guid? sourceApproverId = null;

        if (purchaseOrder.SourceDocumentType == SourceDocumentTypeEnum.AOB)
        {
            var aob = unitOfWork.AOBRepository != null
                ? await unitOfWork.AOBRepository.FindAsync(a => a.Id == purchaseOrder.SourceDocumentId, cancellationToken)
                : null;
            sourceDocNumber = aob?.AOBNumber ?? string.Empty;
            sourceApproverId = aob?.ApprovedBy;
        }
        else if (purchaseOrder.SourceDocumentType == SourceDocumentTypeEnum.NOA)
        {
            var noa = unitOfWork.NoticeOfAwardRepository != null
                ? await unitOfWork.NoticeOfAwardRepository.FindAsync(n => n.Id == purchaseOrder.SourceDocumentId, cancellationToken)
                : null;
            sourceDocNumber = noa?.NOANumber ?? string.Empty;
            sourceApproverName = noa?.ApprovedByName;
            sourceApproverId = noa?.ApprovedById;
        }
        else if (purchaseOrder.SourceDocumentType == SourceDocumentTypeEnum.BAC_RESOLUTION)
        {
            var da = unitOfWork.DirectAcquisitionRepository != null
                ? await unitOfWork.DirectAcquisitionRepository.GetByIdWithConsolidatedPRAsync(purchaseOrder.SourceDocumentId, cancellationToken)
                : null;
            sourceDocNumber = !string.IsNullOrWhiteSpace(da?.DANumber)
                ? da.DANumber
                : (da?.ConsolidatedPR?.CPRNumber ?? purchaseOrder.SourceDocumentId.ToString());
            sourceApproverId = da?.ReviewedByUserId;
        }

        // 2. Resolve procuring entity name from database (matching Contract / NTP implementations)
        var topOrg = unitOfWork.OrganizationRepository != null
            ? (await unitOfWork.OrganizationRepository.FindAsync(o => o.ParentId == null && !o.IsDeleted, cancellationToken)
               ?? await unitOfWork.OrganizationRepository.FindAsync(o => !o.IsDeleted, cancellationToken))
            : null;

        var rootOffice = unitOfWork.OfficeRepository != null
            ? (await unitOfWork.OfficeRepository.FindAsync(o => o.ParentId == null && !o.IsDeleted, cancellationToken)
               ?? await unitOfWork.OfficeRepository.FindAsync(o => !o.IsDeleted, cancellationToken))
            : null;

        var candidate = topOrg?.Name?.Trim()
            ?? (rootOffice?.Organization != null ? rootOffice.Organization.Name?.Trim() : null)
            ?? (rootOffice != null && !string.IsNullOrWhiteSpace(rootOffice.Name) ? rootOffice.Name.Trim() : null)
            ?? string.Empty;

        // Never use 'SuperAdmin Workspace' or sample 'USTP'
        string procuringEntityName = !string.IsNullOrWhiteSpace(candidate) &&
                                     !candidate.Equals("USTP", StringComparison.OrdinalIgnoreCase) &&
                                     !candidate.Contains("SuperAdmin", StringComparison.OrdinalIgnoreCase) &&
                                     !candidate.Contains("Workspace", StringComparison.OrdinalIgnoreCase)
            ? candidate
            : "Agency Name";

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

        // 4. Resolve Approver (HOPE / Authorized Representative)
        var approverId = purchaseOrder.ApprovedById ?? sourceApproverId;
        var resolvedApprover = await DocumentSignatoryResolver.ResolveUserSignatoryAsync(unitOfWork, approverId, cancellationToken);

        if (resolvedApprover == null || string.IsNullOrWhiteSpace(resolvedApprover.FullName))
        {
            var wf = await DocumentSignatoryResolver.ResolveWorkflowApproversAsync(
                unitOfWork, rootOffice?.Id, null, null, cancellationToken);
            resolvedApprover = wf.FinalApprover ?? resolvedApprover;
        }

        var approvedByName = !string.IsNullOrWhiteSpace(resolvedApprover?.FullName)
            ? resolvedApprover.FullName
            : (sourceApproverName ?? string.Empty);

        var approvedByPosition = !string.IsNullOrWhiteSpace(resolvedApprover?.PositionTitle)
            ? resolvedApprover.PositionTitle
            : "Head of the Procuring Entity";

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

            ApprovedByName = approvedByName,
            ApprovedByPosition = approvedByPosition,
            ApprovedAt = purchaseOrder.ApprovedAt,

            Items = items
        };
    }
}
