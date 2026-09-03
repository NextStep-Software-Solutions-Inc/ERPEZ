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
    public string? EvaluatedBy { get; init; }
    public DateTime? EvaluatedAt { get; init; }
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
        var bids = await unitOfWork.SupplierBidRepository.Query()
            .Include(b => b.Supplier)
                .ThenInclude(s => s.SupplierCategory)
            .Include(b => b.SupplierBidItems)
                .ThenInclude(i => i.RFQItem)
            .Where(b => b.RFQId == request.RFQId && !b.IsDeleted)
            .OrderByDescending(b => b.SubmittedAt ?? b.CreatedAt)
            .ToListAsync(cancellationToken);

        var result = bids.Select(b =>
        {
            var documents = new List<RFQBidDocumentDto>();

            // Collect brochures from line items
            foreach (var item in b.SupplierBidItems.Where(i => !string.IsNullOrEmpty(i.BrochureFileUrl)))
            {
                documents.Add(new RFQBidDocumentDto
                {
                    Id = item.BrochureFileId ?? item.Id,
                    Name = $"{item.RFQItem?.ItemNameSnapshot ?? "Item"} Brochure",
                    Type = "PDF",
                    Size = 0,
                    UploadedAt = b.SubmittedAt ?? b.CreatedAt,
                    Url = item.BrochureFileUrl
                });
            }

            return new RFQSupplierBidDto
            {
                Id = b.Id,
                RFQId = b.RFQId,
                SupplierId = b.SupplierId,
                SupplierName = b.Supplier?.Name ?? "Unnamed Supplier",
                SupplierCategory = b.Supplier?.SupplierCategory?.Name,
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
                EvaluatedBy = b.UpdatedBy,
                EvaluatedAt = b.UpdatedAt,
                Documents = documents,
                Items = b.SupplierBidItems.Select(i => new RFQBidItemDetailDto
                {
                    Id = i.Id,
                    RFQItemId = i.RFQItemId,
                    ItemName = i.RFQItem?.ItemNameSnapshot ?? "Unknown Item",
                    Quantity = i.RFQItem?.Quantity ?? 1,
                    ABCUnitPrice = i.RFQItem?.UnitPriceSnapshot ?? 0,
                    UnitPrice = i.UnitPrice,
                    TotalPrice = i.TotalPrice,
                    Brand = i.Brand,
                    Model = i.Model,
                    Color = i.Color,
                    BrochureFileUrl = i.BrochureFileUrl,
                    IsResponsive = i.IsResponsive,
                    DisqualificationReason = i.DisqualificationReason,
                    QualityScore = i.QualityScore
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
