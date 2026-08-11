using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.SubmitSupplierBid;

public class SubmitSupplierBidCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<SubmitSupplierBidCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(SubmitSupplierBidCommand request, CancellationToken cancellationToken)
    {
        // 1. Verify project exists
        var project = await unitOfWork.ProcurementProjectRepository.GetByIdAsync(request.ProcurementProjectId, cancellationToken);
        if (project == null)
        {
            return ApiResponse<Guid>.Fail("Procurement project (RFQ) not found.");
        }

        // 2. Verify supplier exists
        var supplier = await unitOfWork.SupplierRepository.GetByIdAsync(request.SupplierId, cancellationToken);
        if (supplier == null)
        {
            return ApiResponse<Guid>.Fail("Supplier not found.");
        }

        // Validate Status
        var normalizedStatus = request.Status.ToUpperInvariant();
        if (normalizedStatus != "DRAFT" && normalizedStatus != "SUBMITTED")
        {
            return ApiResponse<Guid>.Fail("Status must be DRAFT or SUBMITTED.");
        }

        // 3. Check for existing bid
        var existingBid = await unitOfWork.SupplierBidRepository.Query()
            .Include(sb => sb.SupplierBidItems)
            .FirstOrDefaultAsync(sb => sb.ProcurementProjectId == request.ProcurementProjectId && sb.SupplierId == request.SupplierId, cancellationToken);

        if (existingBid != null)
        {
            existingBid.Status = normalizedStatus;
            existingBid.SubmittedAt = normalizedStatus == "SUBMITTED" ? DateTime.UtcNow : null;

            // Clear old items and add new ones (or update)
            unitOfWork.SupplierBidItemRepository.RemoveRange(existingBid.SupplierBidItems);
            existingBid.SupplierBidItems.Clear();

            foreach (var item in request.Items)
            {
                existingBid.SupplierBidItems.Add(new SupplierBidItem
                {
                    APPItemId = item.APPItemId,
                    UnitPrice = item.UnitPrice,
                    Brand = item.Brand,
                    Model = item.Model,
                    Color = item.Color,
                    BrochureFileUrl = item.BrochureFileUrl,
                    IsResponsive = item.IsResponsive
                });
            }

            unitOfWork.SupplierBidRepository.Update(existingBid);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return ApiResponse<Guid>.Success(existingBid.Id, $"Supplier bid {normalizedStatus.ToLower()} updated successfully.");
        }
        else
        {
            var newBid = new SupplierBid
            {
                ProcurementProjectId = request.ProcurementProjectId,
                SupplierId = request.SupplierId,
                Status = normalizedStatus,
                SubmittedAt = normalizedStatus == "SUBMITTED" ? DateTime.UtcNow : null
            };

            foreach (var item in request.Items)
            {
                newBid.SupplierBidItems.Add(new SupplierBidItem
                {
                    APPItemId = item.APPItemId,
                    UnitPrice = item.UnitPrice,
                    Brand = item.Brand,
                    Model = item.Model,
                    Color = item.Color,
                    BrochureFileUrl = item.BrochureFileUrl,
                    IsResponsive = item.IsResponsive
                });
            }

            await unitOfWork.SupplierBidRepository.AddAsync(newBid, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);

            return ApiResponse<Guid>.Success(newBid.Id, $"Supplier bid {normalizedStatus.ToLower()} submitted successfully.");
        }
    }
}
