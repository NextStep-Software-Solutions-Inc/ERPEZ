using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.DirectAcquisitions.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Sieve.Models;
using Sieve.Services;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Queries.GetDirectAcquisitions;

public class GetDirectAcquisitionsQueryHandler(IUnitOfWork unitOfWork, ISieveProcessor sieveProcessor)
    : IRequestHandler<GetDirectAcquisitionsQuery, PaginatedApiResponse<DirectAcquisitionResponse>>
{
    public async Task<PaginatedApiResponse<DirectAcquisitionResponse>> Handle(GetDirectAcquisitionsQuery query, CancellationToken cancellationToken)
    {
        var dbQuery = unitOfWork.DirectAcquisitionRepository.Query()
            .Include(da => da.ConsolidatedPR)
                .ThenInclude(cpr => cpr.ConsolidatedPRItems)
                    .ThenInclude(ci => ci.PRItem)
                        .ThenInclude(pri => pri.PPMPItem)
            .Include(da => da.ConsolidatedPR)
                .ThenInclude(cpr => cpr.ConsolidatedPRItems)
                    .ThenInclude(ci => ci.PurchaseRequest)
                        .ThenInclude(pr => pr.Office)
            .Include(da => da.ConsolidatedPR)
                .ThenInclude(cpr => cpr.ConsolidatedPRItems)
                    .ThenInclude(ci => ci.PurchaseRequest)
                        .ThenInclude(pr => pr.FundSource)
            .Include(da => da.ConsolidatedPR)
                .ThenInclude(cpr => cpr.ConsolidatedPRItems)
                    .ThenInclude(ci => ci.ProcurementMode)
            .Include(da => da.BACProject)
                .ThenInclude(p => p!.BACResolutions)
            .Include(da => da.DirectPurchaseEntry)
                .ThenInclude(dpe => dpe!.ProofDocuments)
            .Include(da => da.Documents)
            .Where(da => !da.IsDeleted)
            .AsSplitQuery();

        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize,
            Page = query.Page,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        var filteredQuery = sieveProcessor.Apply(sieveModel, dbQuery, applyPagination: false);
        var totalCount = await filteredQuery.CountAsync(cancellationToken);

        var paginatedQuery = sieveProcessor.Apply(sieveModel, filteredQuery, applyFiltering: false, applySorting: false);
        var entities = await paginatedQuery.ToListAsync(cancellationToken);

        var dtos = entities.Select(da =>
        {
            var firstItem = da.ConsolidatedPR?.ConsolidatedPRItems.FirstOrDefault();
            var firstPRItem = firstItem?.PRItem;
            var firstPR = firstItem?.PurchaseRequest;

            string office = firstPR?.Office?.Name ?? "Procurement Office";
            string category = firstPRItem?.PPMPItem?.ProjectType.ToString() ?? "General";

            List<Guid>? selectedIdsList = null;
            if (!string.IsNullOrWhiteSpace(da.Remarks) && da.Remarks.StartsWith("SELECTED_ITEMS:"))
            {
                var rawIds = da.Remarks.Substring("SELECTED_ITEMS:".Length).Split(',', StringSplitOptions.RemoveEmptyEntries);
                selectedIdsList = rawIds.Select(idStr => Guid.TryParse(idStr, out var g) ? g : Guid.Empty)
                                        .Where(g => g != Guid.Empty)
                                        .ToList();
            }

            var resolution = da.BACProject?.BACResolutions.FirstOrDefault();

            string? cleanRemarks = (!string.IsNullOrWhiteSpace(da.Remarks) && da.Remarks.StartsWith("SELECTED_ITEMS:"))
                ? da.DirectPurchaseEntry?.Remarks
                : da.Remarks;

            return new DirectAcquisitionResponse
            {
                Id = da.Id,
                DANumber = da.DANumber,
                ConsolidatedPRId = da.ConsolidatedPRId,
                CPRNumber = da.ConsolidatedPR?.CPRNumber ?? string.Empty,
                ConsolidatedPRDescription = da.ConsolidatedPR?.Description,
                BACProjectId = da.BACProjectId,
                BACResolutionNumber = resolution?.ResolutionNumber,
                Office = office,
                Category = category,
                ModeOfProcurement = "Direct Acquisition",
                TotalABC = da.TotalABC,
                Status = da.Status,
                Remarks = cleanRemarks,
                SelectedItemIds = selectedIdsList,
                CreatedByUserId = da.CreatedByUserId,
                CreatedBy = da.CreatedBy,
                CreatedAt = da.CreatedAt,
                UpdatedAt = da.UpdatedAt,
                PurchaseEntry = da.DirectPurchaseEntry != null ? new DirectPurchaseEntryResponse
                {
                    Id = da.DirectPurchaseEntry.Id,
                    DirectAcquisitionId = da.DirectPurchaseEntry.DirectAcquisitionId,
                    SupplierId = da.DirectPurchaseEntry.SupplierId,
                    SupplierName = da.DirectPurchaseEntry.SupplierName,
                    SupplierTIN = da.DirectPurchaseEntry.SupplierTIN,
                    FinalAmount = da.DirectPurchaseEntry.FinalAmount,
                    TransactionDate = da.DirectPurchaseEntry.TransactionDate,
                    PaymentMethod = da.DirectPurchaseEntry.PaymentMethod,
                    PayeeUserId = da.DirectPurchaseEntry.PayeeUserId,
                    PayeeName = da.DirectPurchaseEntry.PayeeName,
                    Remarks = da.DirectPurchaseEntry.Remarks,
                    ProofDocuments = da.DirectPurchaseEntry.ProofDocuments.Select(doc => new DirectAcquisitionDocumentResponse
                    {
                        Id = doc.Id,
                        DirectAcquisitionId = doc.DirectAcquisitionId,
                        DirectPurchaseEntryId = doc.DirectPurchaseEntryId,
                        FileId = doc.FileId,
                        FileName = doc.FileName,
                        FileType = doc.FileType,
                        BlobUrl = doc.BlobUrl,
                        DocumentType = doc.DocumentType,
                        UploadedAt = doc.UploadedAt
                    }).ToList()
                } : null,
                Documents = da.Documents.Select(doc => new DirectAcquisitionDocumentResponse
                {
                    Id = doc.Id,
                    DirectAcquisitionId = doc.DirectAcquisitionId,
                    DirectPurchaseEntryId = doc.DirectPurchaseEntryId,
                    FileId = doc.FileId,
                    FileName = doc.FileName,
                    FileType = doc.FileType,
                    BlobUrl = doc.BlobUrl,
                    DocumentType = doc.DocumentType,
                    UploadedAt = doc.UploadedAt
                }).ToList(),
                ConsolidatedPRItems = da.ConsolidatedPR != null ? da.ConsolidatedPR.ConsolidatedPRItems.Select(ci => new DirectAcquisitionCPRItemResponse
                {
                    Id = ci.Id,
                    PRItemId = ci.PRItemId,
                    PurchaseRequestId = ci.PurchaseRequestId,
                    PRNumber = ci.PurchaseRequest?.PRNumber ?? string.Empty,
                    PROffice = ci.PurchaseRequest?.Office?.Name ?? string.Empty,
                    ItemName = ci.PRItem?.Name ?? string.Empty,
                    ItemDescription = ci.PRItem?.Description,
                    Category = ci.PRItem?.PPMPItem?.ProjectType.ToString() ?? "General",
                    Fund = ci.PurchaseRequest?.FundSource?.Code ?? ci.PurchaseRequest?.FundSource?.Name,
                    Month = ci.PRItem?.RequestedMonth.ToString(),
                    Unit = ci.PRItem?.PPMPItem?.Unit ?? "unit",
                    Quantity = ci.PRItem?.RequestedQuantity ?? 0,
                    UnitPrice = ci.PRItem?.UnitCost ?? 0,
                    TotalAmount = ci.PRItem?.Amount ?? 0,
                    ProcurementMode = ci.ProcurementMode?.Name,
                    AllowPartial = ci.AllowPartial
                }).ToList() : []
            };
        }).ToList();

        return new PaginatedApiResponse<DirectAcquisitionResponse>(
            dtos,
            query.Page ?? 1,
            query.PageSize ?? 10,
            totalCount);
    }
}
