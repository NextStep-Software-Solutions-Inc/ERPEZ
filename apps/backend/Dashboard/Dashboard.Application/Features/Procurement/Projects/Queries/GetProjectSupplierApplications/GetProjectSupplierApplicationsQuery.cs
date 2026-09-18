using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.Projects.Queries.GetProjectSupplierApplications;

public record GetProjectSupplierApplicationsQuery(Guid ProjectId) : IRequest<ApiResponse<List<ProjectSupplierApplicationDto>>>;

public record ProjectSupplierApplicationDto
{
    public Guid Id { get; init; }
    public Guid ProjectId { get; init; }
    public string Source { get; init; } = "PublicPortal"; // "PublicPortal" or "InternalRFQ"
    public string SupplierName { get; init; } = string.Empty;
    public string? SupplierCategory { get; init; }
    public string? ContactPerson { get; init; }
    public string? ContactNumber { get; init; }
    public string? Email { get; init; }
    public string? TinNumber { get; init; }
    public string? BusinessAddress { get; init; }
    public string EvaluationStatus { get; init; } = string.Empty;
    public DateTime SubmittedAt { get; init; }
    public decimal TotalBidAmount { get; init; }
    public string? Remarks { get; init; }
    public string? DeliveryPeriod { get; init; }
    public string? PaymentTerms { get; init; }
    public string? WarrantyTerms { get; init; }
    public int? ValidityPeriodDays { get; init; }
    public string? EvaluatedBy { get; init; }
    public DateTime? EvaluatedAt { get; init; }
    public List<ApplicationDocumentDto> Documents { get; init; } = [];
    public List<SupplierBidItemDto> Items { get; init; } = [];
}

public record ApplicationDocumentDto
{
    public Guid Id { get; init; }
    public Guid ChecklistItemId { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public long Size { get; init; }
    public DateTime UploadedAt { get; init; }
    public string? Url { get; init; }
    public int EnvelopeType { get; init; } = 1;
}

public record SupplierBidItemDto
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

public class GetProjectSupplierApplicationsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetProjectSupplierApplicationsQuery, ApiResponse<List<ProjectSupplierApplicationDto>>>
{
    public async Task<ApiResponse<List<ProjectSupplierApplicationDto>>> Handle(
        GetProjectSupplierApplicationsQuery request, CancellationToken cancellationToken)
    {
        var project = await unitOfWork.ProcurementProjectRepository.Query()
            .Include(p => p.ConsolidatedPR)
            .FirstOrDefaultAsync(p => p.Id == request.ProjectId, cancellationToken);

        // 1. Fetch Public Portal Applications
        var publicApplications = await unitOfWork.PublicSupplierApplicationRepository.Query()
            .Include(a => a.UploadedDocuments)
                .ThenInclude(d => d.ChecklistItem)
                    .ThenInclude(c => c.MasterDocumentType)
            .Where(a => a.ProcurementProjectId == request.ProjectId && !a.IsDeleted)
            .OrderByDescending(a => a.SubmittedAt)
            .ToListAsync(cancellationToken);

        var biddingSubmissions = await unitOfWork.BiddingSubmissionRepository.Query()
            .Where(bs => bs.ProcurementProjectId == request.ProjectId && !bs.IsDeleted)
            .ToListAsync(cancellationToken);
        var biddingSubmissionsMap = biddingSubmissions
            .Where(bs => bs.PublicSupplierApplicationId.HasValue)
            .ToDictionary(bs => bs.PublicSupplierApplicationId!.Value);

        var result = publicApplications.Select(a =>
        {
            biddingSubmissionsMap.TryGetValue(a.Id, out var bs);
            return new ProjectSupplierApplicationDto
            {
                Id = a.Id,
                ProjectId = a.ProcurementProjectId,
                Source = "PublicPortal",
                SupplierName = a.CompanyName,
                ContactPerson = a.ContactPerson,
                ContactNumber = a.ContactNumber,
                Email = a.EmailAddress,
                TinNumber = a.TinNumber,
                BusinessAddress = a.BusinessAddress,
                EvaluationStatus = NormalizeStatus(a.Status),
                SubmittedAt = a.SubmittedAt,
                TotalBidAmount = bs?.OriginalProposedAmount ?? 0,
                Remarks = bs?.Remarks ?? a.Remarks,
                ValidityPeriodDays = bs?.BidSecurityValidityDays,
                EvaluatedBy = a.EvaluatedBy,
                EvaluatedAt = a.EvaluatedAt,
                Documents = a.UploadedDocuments.Select(d => new ApplicationDocumentDto
                {
                    Id = d.Id,
                    ChecklistItemId = d.ChecklistItemId,
                    Name = d.ChecklistItem?.MasterDocumentType?.Name ?? d.ChecklistItem?.CustomDocumentName ?? d.OriginalFileName,
                    Type = System.IO.Path.GetExtension(d.OriginalFileName).TrimStart('.').ToUpperInvariant(),
                    Size = 0,
                    UploadedAt = d.UploadedAt,
                    Url = d.BlobStorageUrl,
                    EnvelopeType = d.ChecklistItem != null && d.ChecklistItem.EnvelopeType != 0
                        ? d.ChecklistItem.EnvelopeType
                        : (d.ChecklistItem?.MasterDocumentType?.EnvelopeType ?? 1)
                }).ToList()
            };
        }).ToList();

        // 2. Fetch Internal RFQ Supplier Bids if project has an associated ConsolidatedPR with RFQs
        if (project?.ConsolidatedPRId != null)
        {
            var internalBids = await unitOfWork.SupplierBidRepository.Query()
                .Include(b => b.Supplier)
                .Include(b => b.SupplierBidItems)
                    .ThenInclude(bi => bi.RFQItem)
                .Where(b => b.RFQ != null && b.RFQ.ConsolidatedPRId == project.ConsolidatedPRId && !b.IsDeleted)
                .OrderByDescending(b => b.SubmittedAt ?? b.CreatedAt)
                .ToListAsync(cancellationToken);

            var mappedInternalBids = internalBids.Select(b => new ProjectSupplierApplicationDto
            {
                Id = b.Id,
                ProjectId = request.ProjectId,
                Source = "InternalRFQ",
                SupplierName = b.Supplier?.Name ?? "Invited Supplier",
                ContactPerson = b.Supplier?.ContactPerson,
                ContactNumber = b.Supplier?.ContactNumber,
                Email = b.Supplier?.Email,
                TinNumber = b.Supplier?.TINNumber,
                BusinessAddress = b.Supplier?.Address,
                EvaluationStatus = NormalizeStatus(b.Status),
                SubmittedAt = b.SubmittedAt ?? b.CreatedAt,
                TotalBidAmount = b.TotalAmount,
                Remarks = b.Remarks,
                DeliveryPeriod = b.DeliveryPeriod,
                PaymentTerms = b.PaymentTerms,
                WarrantyTerms = b.WarrantyTerms,
                ValidityPeriodDays = b.ValidityPeriodDays,
                EvaluatedBy = null,
                EvaluatedAt = null,
                Items = b.SupplierBidItems.Select(it => new SupplierBidItemDto
                {
                    Id = it.Id,
                    RFQItemId = it.RFQItemId,
                    ItemName = it.RFQItem?.ItemNameSnapshot ?? "Item",
                    Quantity = it.RFQItem?.Quantity ?? 1,
                    ABCUnitPrice = it.RFQItem?.UnitPriceSnapshot ?? 0,
                    UnitPrice = it.UnitPrice,
                    TotalPrice = it.TotalPrice,
                    Brand = it.Brand,
                    Model = it.Model,
                    Color = it.Color,
                    BrochureFileUrl = it.BrochureFileUrl,
                    IsResponsive = it.IsResponsive,
                    DisqualificationReason = it.DisqualificationReason,
                    QualityScore = it.QualityScore
                }).ToList()
            });

            result.AddRange(mappedInternalBids);
        }

        // Order unified submissions by SubmittedAt descending
        result = result.OrderByDescending(x => x.SubmittedAt).ToList();

        return ApiResponse<List<ProjectSupplierApplicationDto>>.Success(result);
    }

    private static string NormalizeStatus(string status)
    {
        return status?.Trim().ToLowerInvariant() switch
        {
            "passed" or "responsive" or "approved" => "Passed",
            "failed" or "disqualified" or "returned" => "Failed",
            _ => "Pending"
        };
    }
}
