using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Queries.GetRFQSupplierBids;

public record GetRFQSupplierBidsQuery(Guid RFQId) : IRequest<ApiResponse<List<RFQSupplierBidDto>>>;

public record RFQSupplierBidDto
{
    public Guid Id { get; init; }
    public Guid RFQId { get; init; }
    public Guid SupplierId { get; init; }
    public string SupplierName { get; init; } = string.Empty;
    public string? SupplierCategory { get; init; }
    public string? ContactPerson { get; init; }
    public string? ContactNumber { get; init; }
    public string? Email { get; init; }
    public string? TinNumber { get; init; }
    public string? RegistrationNumber { get; init; }
    public string? BusinessAddress { get; init; }
    public string? PhilGepsStatus { get; init; }
    public string SubmissionType { get; init; } = "Electronic";
    public string Status { get; init; } = "Pending";
    public DateTime? SubmittedAt { get; init; }
    public decimal TotalBidAmount { get; init; }
    public string? Remarks { get; init; }
    public string? DeliveryPeriod { get; init; }
    public string? PaymentTerms { get; init; }
    public string? WarrantyTerms { get; init; }
    public int? ValidityPeriodDays { get; init; }
    public string? EvaluatedBy { get; init; }
    public DateTime? EvaluatedAt { get; init; }
    public string? QuotationDocumentUrl { get; init; }
    public string? SignatureUrl { get; init; }
    public string? SignatoryName { get; init; }
    public DateTime? DateSigned { get; init; }
    public List<RFQBidDocumentDto> Documents { get; init; } = [];
    public List<RFQBidItemDetailDto> Items { get; init; } = [];
}

public record RFQBidDocumentDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Type { get; init; } = "PDF";
    public long Size { get; init; }
    public DateTime UploadedAt { get; init; }
    public string? Url { get; init; }
}

public record RFQBidItemDetailDto
{
    public Guid Id { get; init; }
    public Guid RFQItemId { get; init; }
    public string ItemName { get; init; } = string.Empty;
    public int Quantity { get; init; }
    public decimal ABCUnitPrice { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal TotalPrice { get; init; }
    public string? Brand { get; init; }
    public string? Model { get; init; }
    public string? Color { get; init; }
    public string? BrochureFileUrl { get; init; }
    public bool IsResponsive { get; init; }
    public string? DisqualificationReason { get; init; }
    public decimal? QualityScore { get; init; }
}

public class GetRFQSupplierBidsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetRFQSupplierBidsQuery, ApiResponse<List<RFQSupplierBidDto>>>
{
    public async Task<ApiResponse<List<RFQSupplierBidDto>>> Handle(
        GetRFQSupplierBidsQuery request, CancellationToken cancellationToken)
    {
        // Self-healing reconciliation: ensure any suppliers registered under RFQSuppliers
        // (such as external public portal applicants who applied prior to SupplierBid generation)
        // have an active SupplierBid and line items created.
        var rfq = await unitOfWork.RFQRepository.Query()
            .Include(r => r.RFQSuppliers)
                .ThenInclude(rs => rs.Supplier)
                    .ThenInclude(s => s.SupplierRequirements)
            .Include(r => r.RFQItems)
            .FirstOrDefaultAsync(r => r.Id == request.RFQId && !r.IsDeleted, cancellationToken);

        if (rfq == null)
        {
            return ApiResponse<List<RFQSupplierBidDto>>.Fail("RFQ not found.");
        }

        if (rfq.Status != StatusEnum.Approved)
        {
            return ApiResponse<List<RFQSupplierBidDto>>.Fail("RFQ is not approved. Supplier submissions can only be accessed for approved RFQs.");
        }

        var existingBidSupplierIds = await unitOfWork.SupplierBidRepository.Query()
            .Where(b => b.RFQId == request.RFQId && !b.IsDeleted)
            .Select(b => b.SupplierId)
            .ToListAsync(cancellationToken);

        var unbiddedSuppliers = rfq.RFQSuppliers
            .Where(rs => !rs.IsDeleted && rs.Supplier != null && !existingBidSupplierIds.Contains(rs.SupplierId))
            .ToList();

        if (unbiddedSuppliers.Any())
        {
            foreach (var unbidded in unbiddedSuppliers)
            {
                var isPublic = unbidded.Supplier?.CreatedBy == "PublicPortal";
                var quotationDoc = unbidded.Supplier?.SupplierRequirements
                    ?.FirstOrDefault(r => r.RequirementName.Contains("Price Quotation", StringComparison.OrdinalIgnoreCase));

                var bidId = Guid.NewGuid();
                var autoBid = new ERPEZ.Domain.Entities.Procurement.SupplierBid
                {
                    Id = bidId,
                    RFQId = request.RFQId,
                    SupplierId = unbidded.SupplierId,
                    Supplier = unbidded.Supplier!,
                    SubmissionType = isPublic ? "PublicPortal" : "Electronic",
                    Status = "Submitted",
                    SubmittedAt = unbidded.InvitedAt != default ? unbidded.InvitedAt : unbidded.CreatedAt,
                    Remarks = isPublic ? $"Applied via BAC Public Portal ({unbidded.Supplier?.Name})" : "Invited RFQ Submission",
                    TotalAmount = 0m,
                    SupplierBidItems = rfq.RFQItems.Where(i => !i.IsDeleted).Select(item => new ERPEZ.Domain.Entities.Procurement.SupplierBidItem
                    {
                        Id = Guid.NewGuid(),
                        SupplierBidId = bidId,
                        RFQItemId = item.Id,
                        RFQItem = item,
                        UnitPrice = 0m,
                        TotalPrice = 0m,
                        IsResponsive = true,
                        BrochureFileUrl = quotationDoc?.Url
                    }).ToList()
                };
                await unitOfWork.SupplierBidRepository.AddAsync(autoBid, cancellationToken);
            }
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }

        var bids = await unitOfWork.SupplierBidRepository.Query()
            .Include(b => b.Supplier)
                .ThenInclude(s => s!.SupplierRequirements)
            .Include(b => b.SupplierBidItems)
            .Where(b => b.RFQId == request.RFQId && !b.IsDeleted)
            .OrderByDescending(b => b.SubmittedAt ?? b.CreatedAt)
            .ToListAsync(cancellationToken);

        var rfqItemMap = rfq?.RFQItems?.ToDictionary(item => item.Id) ?? [];

        var categoryIds = bids
            .Where(b => b.Supplier != null && b.Supplier.SupplierCategoryId != Guid.Empty)
            .Select(b => b.Supplier!.SupplierCategoryId)
            .Distinct()
            .ToList();

        var categoriesMap = categoryIds.Count > 0
            ? await unitOfWork.SupplierCategoryRepository.Query()
                .Where(c => categoryIds.Contains(c.Id) && !c.IsDeleted)
                .ToDictionaryAsync(c => c.Id, c => c.Name, cancellationToken)
            : new Dictionary<Guid, string>();

        var result = bids.Select(b =>
        {
            var seenUrls = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var documents = new List<RFQBidDocumentDto>();

            // Collect compliance documents and public portal attachments
            if (b.Supplier?.SupplierRequirements != null)
            {
                foreach (var req in b.Supplier.SupplierRequirements.Where(r => !string.IsNullOrEmpty(r.Url) && !r.IsDeleted))
                {
                    if (seenUrls.Add(req.Url!))
                    {
                        documents.Add(new RFQBidDocumentDto
                        {
                            Id = req.Id,
                            Name = req.RequirementName,
                            Type = "PDF",
                            Size = 0,
                            UploadedAt = req.CreatedAt,
                            Url = req.Url
                        });
                    }
                }
            }

            // Collect brochures and forms from line items
            foreach (var item in b.SupplierBidItems.Where(i => !string.IsNullOrEmpty(i.BrochureFileUrl)))
            {
                if (seenUrls.Add(item.BrochureFileUrl!))
                {
                    var itemName = rfqItemMap.TryGetValue(item.RFQItemId, out var foundItem)
                        ? foundItem.ItemNameSnapshot
                        : (item.RFQItem?.ItemNameSnapshot ?? "Item");

                    documents.Add(new RFQBidDocumentDto
                    {
                        Id = item.BrochureFileId ?? item.Id,
                        Name = $"{itemName} Brochure / Form",
                        Type = "PDF",
                        Size = 0,
                        UploadedAt = b.SubmittedAt ?? b.CreatedAt,
                        Url = item.BrochureFileUrl
                    });
                }
            }

            // Collect attached official quotation document if submitted manually or routed
            if (!string.IsNullOrEmpty(b.QuotationDocumentUrl) && seenUrls.Add(b.QuotationDocumentUrl))
            {
                documents.Add(new RFQBidDocumentDto
                {
                    Id = Guid.NewGuid(),
                    Name = "Signed RFQ Quotation Document",
                    Type = "PDF",
                    Size = 0,
                    UploadedAt = b.SubmittedAt ?? b.CreatedAt,
                    Url = b.QuotationDocumentUrl
                });
            }

            return new RFQSupplierBidDto
            {
                Id = b.Id,
                RFQId = b.RFQId,
                SupplierId = b.SupplierId,
                SupplierName = b.Supplier?.Name ?? "Unnamed Supplier",
                SupplierCategory = b.Supplier != null && categoriesMap.TryGetValue(b.Supplier.SupplierCategoryId, out var catName)
                    ? catName
                    : b.Supplier?.SupplierCategory?.Name,
                ContactPerson = b.Supplier?.ContactPerson,
                ContactNumber = b.Supplier?.ContactNumber,
                Email = b.Supplier?.Email,
                TinNumber = b.Supplier?.TINNumber,
                RegistrationNumber = b.Supplier?.BusinessPermitNo,
                BusinessAddress = b.Supplier?.Address,
                PhilGepsStatus = !string.IsNullOrEmpty(b.Supplier?.PhilGEPSNumber) ? "Active" : "Pending",
                SubmissionType = b.SubmissionType,
                Status = NormalizeStatus(b.Status),
                SubmittedAt = b.SubmittedAt ?? b.CreatedAt,
                TotalBidAmount = b.TotalAmount,
                Remarks = b.Remarks,
                DeliveryPeriod = b.DeliveryPeriod,
                PaymentTerms = b.PaymentTerms,
                WarrantyTerms = b.WarrantyTerms,
                ValidityPeriodDays = b.ValidityPeriodDays,
                EvaluatedBy = b.UpdatedBy,
                EvaluatedAt = b.UpdatedAt,
                QuotationDocumentUrl = b.QuotationDocumentUrl,
                SignatureUrl = b.SignatureUrl,
                SignatoryName = b.SignatoryName,
                DateSigned = b.DateSigned,
                Documents = documents,
                Items = b.SupplierBidItems.Select(i =>
                {
                    var rItem = rfqItemMap.GetValueOrDefault(i.RFQItemId);
                    return new RFQBidItemDetailDto
                    {
                        Id = i.Id,
                        RFQItemId = i.RFQItemId,
                        ItemName = rItem?.ItemNameSnapshot ?? i.RFQItem?.ItemNameSnapshot ?? "Unknown Item",
                        Quantity = rItem?.Quantity ?? i.RFQItem?.Quantity ?? 1,
                        ABCUnitPrice = rItem?.UnitPriceSnapshot ?? i.RFQItem?.UnitPriceSnapshot ?? 0,
                        UnitPrice = i.UnitPrice,
                        TotalPrice = i.TotalPrice,
                        Brand = i.Brand,
                        Model = i.Model,
                        Color = i.Color,
                        BrochureFileUrl = i.BrochureFileUrl,
                        IsResponsive = i.IsResponsive,
                        DisqualificationReason = i.DisqualificationReason,
                        QualityScore = i.QualityScore
                    };
                }).ToList()
            };
        }).ToList();

        return ApiResponse<List<RFQSupplierBidDto>>.Success(result);
    }

    private static string NormalizeStatus(string status)
    {
        return status?.Trim().ToLowerInvariant() switch
        {
            "passed" or "approved" or "responsive" => "Passed",
            "failed" or "rejected" or "disqualified" => "Failed",
            _ => "Pending"
        };
    }
}
