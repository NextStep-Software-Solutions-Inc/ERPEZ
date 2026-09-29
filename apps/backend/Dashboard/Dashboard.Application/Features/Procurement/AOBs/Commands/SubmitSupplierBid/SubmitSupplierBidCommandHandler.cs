using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.SubmitSupplierBid;

public class SubmitSupplierBidCommandHandler(IUnitOfWork unitOfWork, IFileStorageService? fileStorageService = null)
    : IRequestHandler<SubmitSupplierBidCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(SubmitSupplierBidCommand request, CancellationToken cancellationToken)
    {
        // 1. Verify RFQ exists
        var rfq = await unitOfWork.RFQRepository.Query()
            .Include(r => r.RFQItems)
            .Include(r => r.RFQSuppliers)
            .FirstOrDefaultAsync(r => r.Id == request.RFQId && !r.IsDeleted, cancellationToken);

        if (rfq == null)
        {
            return ApiResponse<Guid>.Fail("Request for Quotation (RFQ) not found.");
        }

        // 2. Verify RFQ is approved
        if (rfq.Status != StatusEnum.Approved)
        {
            return ApiResponse<Guid>.Fail("Cannot submit bids for an RFQ that has not been approved by the BAC.");
        }

        // 3. Verify supplier exists
        var supplier = await unitOfWork.SupplierRepository.GetByIdAsync(request.SupplierId, cancellationToken);
        if (supplier == null)
        {
            return ApiResponse<Guid>.Fail("Supplier not found.");
        }

        // 4. Verify supplier was invited to this RFQ
        var isInvited = rfq.RFQSuppliers.Any(s => s.SupplierId == request.SupplierId);
        if (!isInvited)
        {
            return ApiResponse<Guid>.Fail("Supplier is not invited to this RFQ.");
        }

        // 3. Validate Status
        var normalizedStatus = request.Status.ToUpperInvariant();
        if (normalizedStatus != "DRAFT" && normalizedStatus != "SUBMITTED")
        {
            return ApiResponse<Guid>.Fail("Status must be DRAFT or SUBMITTED.");
        }

        // 4. Validate RFQ Items exist in this RFQ
        var rfqItemDict = rfq.RFQItems.ToDictionary(i => i.Id);
        foreach (var item in request.Items)
        {
            if (!rfqItemDict.ContainsKey(item.RFQItemId))
            {
                return ApiResponse<Guid>.Fail($"RFQ item '{item.RFQItemId}' does not belong to the specified RFQ.");
            }
        }

        // Calculate total amount
        decimal totalBidAmount = 0;
        var processedBidItems = new List<SupplierBidItem>();

        foreach (var item in request.Items)
        {
            var rfqItem = rfqItemDict[item.RFQItemId];
            var lineTotal = item.UnitPrice * rfqItem.Quantity;
            totalBidAmount += lineTotal;

            var brochureUrl = item.BrochureFileUrl;
            var brochureId = item.BrochureFileId;

            // Automatically promote brochure from temp to permanent storage so it is not purged by TempFileCleanupService
            if (fileStorageService != null)
            {
                if (brochureId.HasValue && brochureId.Value != Guid.Empty)
                {
                    try
                    {
                        var (promotedUrl, _) = await fileStorageService.PromoteFileAsync(brochureId.Value, cancellationToken);
                        brochureUrl = promotedUrl;
                    }
                    catch
                    {
                        // File may already be promoted
                    }
                }
                else if (!string.IsNullOrWhiteSpace(brochureUrl))
                {
                    var match = Regex.Match(brochureUrl, @"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}");
                    if (match.Success && Guid.TryParse(match.Value, out var parsedId))
                    {
                        brochureId = parsedId;
                        try
                        {
                            var (promotedUrl, _) = await fileStorageService.PromoteFileAsync(parsedId, cancellationToken);
                            brochureUrl = promotedUrl;
                        }
                        catch
                        {
                            // File may already be promoted
                        }
                    }
                }
            }

            processedBidItems.Add(new SupplierBidItem
            {
                RFQItemId = item.RFQItemId,
                UnitPrice = item.UnitPrice,
                TotalPrice = lineTotal,
                Brand = item.Brand,
                Model = item.Model,
                Color = item.Color,
                BrochureFileId = brochureId,
                BrochureFileUrl = brochureUrl,
                IsResponsive = item.IsResponsive,
                DisqualificationReason = item.DisqualificationReason,
                QualityScore = item.QualityScore
            });
        }

        // 5. Check for existing bid
        var existingBid = await unitOfWork.SupplierBidRepository.Query()
            .Include(sb => sb.SupplierBidItems)
            .FirstOrDefaultAsync(sb => sb.RFQId == request.RFQId && sb.SupplierId == request.SupplierId, cancellationToken);

        var cleanQuotationDoc = !string.IsNullOrWhiteSpace(request.QuotationDocumentUrl) ? request.QuotationDocumentUrl.Trim() : null;
        if (fileStorageService != null && !string.IsNullOrWhiteSpace(cleanQuotationDoc))
        {
            var match = Regex.Match(cleanQuotationDoc, @"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}");
            if (match.Success && Guid.TryParse(match.Value, out var parsedDocId))
            {
                try
                {
                    var (promotedUrl, _) = await fileStorageService.PromoteFileAsync(parsedDocId, cancellationToken);
                    cleanQuotationDoc = promotedUrl;
                }
                catch
                {
                    // File may already be promoted
                }
            }
        }

        var cleanSignatory = !string.IsNullOrWhiteSpace(request.SignatoryName) ? request.SignatoryName.Trim() : null;
        var cleanSignature = !string.IsNullOrWhiteSpace(request.SignatureUrl) ? request.SignatureUrl.Trim() : null;

        if (existingBid != null)
        {
            existingBid.SubmissionType = request.SubmissionType;
            existingBid.Status = normalizedStatus;
            existingBid.ValidityPeriodDays = request.ValidityPeriodDays;
            existingBid.DeliveryPeriod = request.DeliveryPeriod;
            existingBid.PaymentTerms = request.PaymentTerms;
            existingBid.WarrantyTerms = request.WarrantyTerms;
            existingBid.Remarks = request.Remarks;

            existingBid.QuotationDocumentUrl = cleanQuotationDoc ?? existingBid.QuotationDocumentUrl;
            existingBid.SignatureUrl = cleanSignature ?? existingBid.SignatureUrl;
            existingBid.SignatoryName = cleanSignatory ?? existingBid.SignatoryName;
            existingBid.DateSigned = request.DateSigned ?? (cleanSignatory != null ? DateTime.UtcNow : existingBid.DateSigned);
            existingBid.TotalAmount = totalBidAmount;
            existingBid.SubmittedAt = normalizedStatus == "SUBMITTED" ? DateTime.UtcNow : existingBid.SubmittedAt;
            existingBid.UpdatedAt = DateTime.UtcNow;

            // Replace line items
            unitOfWork.SupplierBidItemRepository.RemoveRange(existingBid.SupplierBidItems);
            existingBid.SupplierBidItems.Clear();

            foreach (var bidItem in processedBidItems)
            {
                existingBid.SupplierBidItems.Add(bidItem);
            }

            unitOfWork.SupplierBidRepository.Update(existingBid);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return ApiResponse<Guid>.Success(existingBid.Id, $"Supplier bid {normalizedStatus.ToLower()} updated successfully.");
        }
        else
        {
            var newBid = new SupplierBid
            {
                RFQId = request.RFQId,
                SupplierId = request.SupplierId,
                SubmissionType = request.SubmissionType,
                Status = normalizedStatus,
                ValidityPeriodDays = request.ValidityPeriodDays,
                DeliveryPeriod = request.DeliveryPeriod,
                PaymentTerms = request.PaymentTerms,
                WarrantyTerms = request.WarrantyTerms,
                Remarks = request.Remarks,
                QuotationDocumentUrl = cleanQuotationDoc,
                SignatureUrl = cleanSignature,
                SignatoryName = cleanSignatory,
                DateSigned = request.DateSigned ?? (cleanSignatory != null ? DateTime.UtcNow : null),
                TotalAmount = totalBidAmount,
                SubmittedAt = normalizedStatus == "SUBMITTED" ? DateTime.UtcNow : null,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "System"
            };

            foreach (var bidItem in processedBidItems)
            {
                newBid.SupplierBidItems.Add(bidItem);
            }

            await unitOfWork.SupplierBidRepository.AddAsync(newBid, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return ApiResponse<Guid>.Success(newBid.Id, $"Supplier bid {normalizedStatus.ToLower()} submitted successfully.");
        }
    }
}
