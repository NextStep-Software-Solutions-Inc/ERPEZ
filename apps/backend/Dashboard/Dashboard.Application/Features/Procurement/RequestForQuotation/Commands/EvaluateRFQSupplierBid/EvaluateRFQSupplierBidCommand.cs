using ERPEZ.Application.Features.Procurement.RequestForQuotation.Queries.GetRFQSupplierBids;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.EvaluateRFQSupplierBid;

public record EvaluateRFQSupplierBidRequest
{
    public string EvaluationStatus { get; init; } = string.Empty;
    public string? Remarks { get; init; }
    public string? EvaluatedBy { get; init; }
}

public record EvaluateRFQSupplierBidCommand : IRequest<ApiResponse<RFQSupplierBidDto>>
{
    public Guid RFQId { get; init; }
    public Guid BidId { get; init; }
    public EvaluateRFQSupplierBidRequest Request { get; init; } = new();
}

public class EvaluateRFQSupplierBidCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<EvaluateRFQSupplierBidCommand, ApiResponse<RFQSupplierBidDto>>
{
    public async Task<ApiResponse<RFQSupplierBidDto>> Handle(
        EvaluateRFQSupplierBidCommand command, CancellationToken cancellationToken)
    {
        var bid = await unitOfWork.SupplierBidRepository.Query()
            .Include(b => b.Supplier)
                .ThenInclude(s => s.SupplierCategory)
            .Include(b => b.Supplier)
                .ThenInclude(s => s.SupplierRequirements)
            .Include(b => b.SupplierBidItems)
                .ThenInclude(i => i.RFQItem)
            .FirstOrDefaultAsync(
                b => b.Id == command.BidId && b.RFQId == command.RFQId && !b.IsDeleted,
                cancellationToken)
            ?? throw new NotFoundException("Supplier bid not found for this RFQ.");

        var normalizedStatus = command.Request.EvaluationStatus?.Trim();
        if (string.IsNullOrEmpty(normalizedStatus))
        {
            throw new ValidationException("Evaluation status is required.");
        }

        if (string.Equals(normalizedStatus, "Failed", StringComparison.OrdinalIgnoreCase) &&
            string.IsNullOrWhiteSpace(command.Request.Remarks))
        {
            throw new ValidationException("Remarks are required when marking a bid as Failed.");
        }

        bid.Status = normalizedStatus;
        bid.Remarks = command.Request.Remarks;
        bid.UpdatedBy = command.Request.EvaluatedBy ?? "BAC Officer";
        bid.UpdatedAt = DateTime.UtcNow;

        unitOfWork.SupplierBidRepository.Update(bid);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var seenUrls = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        var documents = new List<RFQBidDocumentDto>();

        if (bid.Supplier?.SupplierRequirements != null)
        {
            foreach (var req in bid.Supplier.SupplierRequirements.Where(r => !string.IsNullOrEmpty(r.Url) && !r.IsDeleted))
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

        foreach (var item in bid.SupplierBidItems.Where(i => !string.IsNullOrEmpty(i.BrochureFileUrl)))
        {
            if (seenUrls.Add(item.BrochureFileUrl!))
            {
                documents.Add(new RFQBidDocumentDto
                {
                    Id = item.BrochureFileId ?? item.Id,
                    Name = $"{item.RFQItem?.ItemNameSnapshot ?? "Item"} Brochure / Form",
                    Type = "PDF",
                    Size = 0,
                    UploadedAt = bid.SubmittedAt ?? bid.CreatedAt,
                    Url = item.BrochureFileUrl
                });
            }
        }

        var dto = new RFQSupplierBidDto
        {
            Id = bid.Id,
            RFQId = bid.RFQId,
            SupplierId = bid.SupplierId,
            SupplierName = bid.Supplier?.Name ?? "Unnamed Supplier",
            SupplierCategory = bid.Supplier?.SupplierCategory?.Name,
            ContactPerson = bid.Supplier?.ContactPerson,
            ContactNumber = bid.Supplier?.ContactNumber,
            Email = bid.Supplier?.Email,
            TinNumber = bid.Supplier?.TINNumber,
            RegistrationNumber = bid.Supplier?.BusinessPermitNo,
            BusinessAddress = bid.Supplier?.Address,
            PhilGepsStatus = !string.IsNullOrEmpty(bid.Supplier?.PhilGEPSNumber) ? "Active" : "Pending",
            SubmissionType = bid.SubmissionType,
            Status = bid.Status,
            SubmittedAt = bid.SubmittedAt ?? bid.CreatedAt,
            TotalBidAmount = bid.TotalAmount,
            Remarks = bid.Remarks,
            EvaluatedBy = bid.UpdatedBy,
            EvaluatedAt = bid.UpdatedAt,
            Documents = documents,
            Items = bid.SupplierBidItems.Select(i => new RFQBidItemDetailDto
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

        return ApiResponse<RFQSupplierBidDto>.Success(dto, $"Supplier bid marked as {bid.Status} successfully.");
    }
}
