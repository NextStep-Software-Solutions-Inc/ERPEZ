using ERPEZ.Shared.Common;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using MediatR;
 
namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.SubmitRFQ;
 
public class SubmitRFQCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<SubmitRFQCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(SubmitRFQCommand request, CancellationToken cancellationToken)
    {
        var rfq = await unitOfWork.RFQRepository.GetRFQWithDetailsAsync(request.RFQId, cancellationToken);
        if (rfq is null)
        {
            return ApiResponse<bool>.Fail("RFQ not found.");
        }
 
        if (rfq.Status is not (StatusEnum.Draft or StatusEnum.Returned))
        {
            return ApiResponse<bool>.Fail($"RFQ cannot be submitted from its current status ({rfq.Status}).");
        }
 
        if (rfq.RFQItems.Count == 0)
        {
            return ApiResponse<bool>.Fail("RFQ must have at least one item before it can be submitted.");
        }
 
        if (rfq.ModeOfProcurementId is null)
        {
            return ApiResponse<bool>.Fail("RFQ has no procurement mode assigned.");
        }
 
        var mode = await unitOfWork.ProcurementModeRepository.GetByIdAsync(rfq.ModeOfProcurementId.Value, cancellationToken);
        if (mode is null)
        {
            return ApiResponse<bool>.Fail("Procurement mode not found.");
        }
 
        // GPPB Rule 1: threshold check.
        var totalAmount = rfq.RFQItems.Sum(i => i.Quantity * i.UnitPriceSnapshot);
        if (totalAmount < mode.MinThreshold || (mode.MaxThreshold.HasValue && totalAmount > mode.MaxThreshold.Value))
        {
            return ApiResponse<bool>.Fail(
                $"RFQ total amount ({totalAmount:C}) is outside the threshold range for '{mode.Name}' " +
                $"({mode.MinThreshold:C} - {(mode.MaxThreshold.HasValue ? mode.MaxThreshold.Value.ToString("C") : "no upper limit")}).");
        }
 
        // GPPB Rule 2: minimum supplier count.
        var invitedSupplierCount = rfq.RFQSuppliers.Count;
        if (invitedSupplierCount < mode.MinSupplierCount)
        {
            return ApiResponse<bool>.Fail(
                $"'{mode.Name}' requires at least {mode.MinSupplierCount} invited supplier(s); only {invitedSupplierCount} invited.");
        }
 
        // GPPB Rule 3 (re-check at submit time): no item now exceeds its remaining sourceable quantity,
        // since other RFQs may have consumed quantity since items were added to this draft.
        foreach (var item in rfq.RFQItems)
        {
            var prItem = item.CPRItem?.PRItem;
            if (prItem is null) continue;
 
            var sourcedElsewhere = await unitOfWork.RFQRepository.GetSourcedQuantityForCprItemAsync(
                item.CPRItemId, excludingRfqId: rfq.Id, cancellationToken);
 
            if (sourcedElsewhere + item.Quantity > prItem.RequestedQuantity)
            {
                return ApiResponse<bool>.Fail(
                    $"'{item.ItemNameSnapshot}' now exceeds its remaining unsourced quantity " +
                    $"due to sourcing on another RFQ. Please adjust the quantity.");
            }
        }
 
        rfq.Status = StatusEnum.Submitted;
        rfq.TotalAmount = totalAmount;
 
        unitOfWork.RFQRepository.Update(rfq);
        await unitOfWork.SaveChangesAsync(cancellationToken);
 
        return ApiResponse<bool>.Success(true);
    }
}
