using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.UpdateRFQ;

public class UpdateRFQCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateRFQCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(UpdateRFQCommand request, CancellationToken cancellationToken)
    {
        var rfq = await unitOfWork.RFQRepository.GetRFQWithDetailsAsync(request.RFQId, cancellationToken);
        if (rfq is null)
        {
            return ApiResponse<bool>.Fail("RFQ not found.");
        }

        // Lock: only Draft RFQs can be edited. Returned RFQs must go through Reopen first.
        if (rfq.Status != StatusEnum.Draft)
        {
            return ApiResponse<bool>.Fail(
                $"Only RFQs in Draft status can be edited. Current status: {rfq.Status}.");
        }

        // Uniqueness checks, excluding this RFQ's own current values.
        if (rfq.RFQNumber != request.RFQNumber
            && await unitOfWork.RFQRepository.HasRFQNumberAsync(request.RFQNumber, cancellationToken))
        {
            return ApiResponse<bool>.Fail("RFQ Number already exists.");
        }

        if (rfq.TracingNumber != request.TracingNumber
            && await unitOfWork.RFQRepository.HasTracingNumberAsync(request.TracingNumber, cancellationToken))
        {
            return ApiResponse<bool>.Fail("Tracing Number already exists.");
        }

        // Supplier eligibility, same rule as CreateRFQCommand.
        var distinctSupplierIds = request.SupplierIds.Distinct().ToList();
        foreach (var supplierId in distinctSupplierIds)
        {
            var supplier = await unitOfWork.SupplierRepository.GetByIdAsync(supplierId, cancellationToken);
            if (supplier is null || supplier.IsBlocked || supplier.Status != nameof(SupplierStatusEnum.Approved))
            {
                return ApiResponse<bool>.Fail("One or more selected suppliers are blocked or not approved.");
            }
        }

        // Header field updates.
        rfq.RFQNumber = request.RFQNumber;
        rfq.TracingNumber = request.TracingNumber;
        rfq.Description = request.Description;
        rfq.Date = request.Date;
        rfq.Deadline = request.Deadline;
        rfq.DeliveryPeriod = request.DeliveryPeriod;
        rfq.Purpose = request.Purpose;

        // Full replacement of the invited supplier list.
        var currentSupplierIds = rfq.RFQSuppliers.Select(s => s.SupplierId).ToHashSet();
        var toRemove = rfq.RFQSuppliers.Where(s => !distinctSupplierIds.Contains(s.SupplierId)).ToList();
        foreach (var supplierToRemove in toRemove)
        {
            rfq.RFQSuppliers.Remove(supplierToRemove);
        }

        var toAdd = distinctSupplierIds.Where(id => !currentSupplierIds.Contains(id));
        foreach (var supplierId in toAdd)
        {
            rfq.RFQSuppliers.Add(new RFQSupplier
            {
                SupplierId = supplierId,
                InvitedAt = DateTime.UtcNow
            });
        }

        unitOfWork.RFQRepository.Update(rfq);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(true, "RFQ updated.");
    }
}
