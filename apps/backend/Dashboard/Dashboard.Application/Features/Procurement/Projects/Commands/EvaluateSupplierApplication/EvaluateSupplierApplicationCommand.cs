using ERPEZ.Application.Features.Procurement.Projects.Queries.GetProjectSupplierApplications;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.EvaluateSupplierApplication;

public record EvaluateSupplierApplicationRequest
{
    public string EvaluationStatus { get; init; } = string.Empty;
    public string? Remarks { get; init; }
    public string? EvaluatedBy { get; init; }
}

public record EvaluateSupplierApplicationCommand : IRequest<ApiResponse<ProjectSupplierApplicationDto>>
{
    public Guid ProjectId { get; init; }
    public Guid ApplicationId { get; init; }
    public EvaluateSupplierApplicationRequest Request { get; init; } = new();
}

public class EvaluateSupplierApplicationCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<EvaluateSupplierApplicationCommand, ApiResponse<ProjectSupplierApplicationDto>>
{
    public async Task<ApiResponse<ProjectSupplierApplicationDto>> Handle(
        EvaluateSupplierApplicationCommand command, CancellationToken cancellationToken)
    {
        var normalizedStatus = command.Request.EvaluationStatus?.Trim();
        if (string.IsNullOrEmpty(normalizedStatus))
        {
            throw new ValidationException("Evaluation status is required.");
        }

        if (string.Equals(normalizedStatus, "Failed", StringComparison.OrdinalIgnoreCase) &&
            string.IsNullOrWhiteSpace(command.Request.Remarks))
        {
            throw new ValidationException("Remarks are required when marking a submission as Failed.");
        }

        // 1. Check if it's a Public Portal Application
        var application = await unitOfWork.PublicSupplierApplicationRepository.Query()
            .Include(a => a.UploadedDocuments)
                .ThenInclude(d => d.ChecklistItem)
                    .ThenInclude(c => c.MasterDocumentType)
            .FirstOrDefaultAsync(
                a => a.Id == command.ApplicationId && a.ProcurementProjectId == command.ProjectId && !a.IsDeleted,
                cancellationToken);

        if (application != null)
        {
            application.Status = normalizedStatus;
            application.Remarks = command.Request.Remarks;
            application.EvaluatedBy = command.Request.EvaluatedBy ?? "BAC Officer";
            application.EvaluatedAt = DateTime.UtcNow;
            application.UpdatedAt = DateTime.UtcNow;

            unitOfWork.PublicSupplierApplicationRepository.Update(application);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            var dto = new ProjectSupplierApplicationDto
            {
                Id = application.Id,
                ProjectId = application.ProcurementProjectId,
                Source = "PublicPortal",
                SupplierName = application.CompanyName,
                ContactPerson = application.ContactPerson,
                ContactNumber = application.ContactNumber,
                Email = application.EmailAddress,
                TinNumber = application.TinNumber,
                BusinessAddress = application.BusinessAddress,
                EvaluationStatus = application.Status,
                SubmittedAt = application.SubmittedAt,
                TotalBidAmount = 0,
                Remarks = application.Remarks,
                EvaluatedBy = application.EvaluatedBy,
                EvaluatedAt = application.EvaluatedAt,
                Documents = application.UploadedDocuments.Select(d => new ApplicationDocumentDto
                {
                    Id = d.Id,
                    Name = d.ChecklistItem?.MasterDocumentType?.Name ?? d.OriginalFileName,
                    Type = System.IO.Path.GetExtension(d.OriginalFileName).TrimStart('.').ToUpperInvariant(),
                    Size = 0,
                    UploadedAt = d.UploadedAt,
                    Url = d.BlobStorageUrl
                }).ToList()
            };

            return ApiResponse<ProjectSupplierApplicationDto>.Success(dto, $"Application marked as {application.Status} successfully.");
        }

        // 2. Check if it's an Internal RFQ Supplier Bid
        var internalBid = await unitOfWork.SupplierBidRepository.Query()
            .Include(b => b.Supplier)
            .Include(b => b.SupplierBidItems)
                .ThenInclude(bi => bi.RFQItem)
            .FirstOrDefaultAsync(b => b.Id == command.ApplicationId && !b.IsDeleted, cancellationToken);

        if (internalBid != null)
        {
            internalBid.Status = normalizedStatus;
            internalBid.Remarks = command.Request.Remarks;
            internalBid.UpdatedAt = DateTime.UtcNow;

            unitOfWork.SupplierBidRepository.Update(internalBid);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            var dto = new ProjectSupplierApplicationDto
            {
                Id = internalBid.Id,
                ProjectId = command.ProjectId,
                Source = "InternalRFQ",
                SupplierName = internalBid.Supplier?.Name ?? "Invited Supplier",
                ContactPerson = internalBid.Supplier?.ContactPerson,
                ContactNumber = internalBid.Supplier?.ContactNumber,
                Email = internalBid.Supplier?.Email,
                TinNumber = internalBid.Supplier?.TINNumber,
                BusinessAddress = internalBid.Supplier?.Address,
                EvaluationStatus = internalBid.Status,
                SubmittedAt = internalBid.SubmittedAt ?? internalBid.CreatedAt,
                TotalBidAmount = internalBid.TotalAmount,
                Remarks = internalBid.Remarks,
                EvaluatedBy = command.Request.EvaluatedBy ?? "BAC Officer",
                EvaluatedAt = DateTime.UtcNow,
                Items = internalBid.SupplierBidItems.Select(it => new SupplierBidItemDto
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
            };

            return ApiResponse<ProjectSupplierApplicationDto>.Success(dto, $"Supplier bid marked as {internalBid.Status} successfully.");
        }

        throw new NotFoundException("Supplier application or bid not found.");
    }
}
