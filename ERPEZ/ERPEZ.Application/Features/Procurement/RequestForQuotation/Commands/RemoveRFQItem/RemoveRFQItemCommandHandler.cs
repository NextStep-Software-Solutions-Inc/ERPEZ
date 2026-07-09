using ERPEZ.Shared.Common;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Domain.Enums;
using MediatR;
 
namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.RemoveRFQItem;
 
public class RemoveRFQItemCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<RemoveRFQItemCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(RemoveRFQItemCommand request, CancellationToken cancellationToken)
    {
        var rfq = await unitOfWork.RFQRepository.GetRFQWithDetailsAsync(request.RFQId, cancellationToken);
        if (rfq is null)
        {
            return ApiResponse<bool>.Fail("RFQ not found.");
        }

        if (rfq.Status != StatusEnum.Draft && rfq.Status != StatusEnum.Returned)
        {
            return ApiResponse<bool>.Fail("Items can only be modified on Draft or Returned RFQs.");
        }

        var item = rfq.RFQItems.FirstOrDefault(i => i.Id == request.RFQItemId);
        if (item is null)
        {
            return ApiResponse<bool>.Fail("RFQ item not found.");
        }
 
        unitOfWork.RFQRepository.RemoveItem(item);
 
        rfq.TotalAmount = rfq.RFQItems
            .Where(i => i.Id != request.RFQItemId)
            .Sum(i => i.Quantity * i.UnitPriceSnapshot);
 
        // If this was the last item, release the mode lock so a new mode can be chosen on next add.
        if (rfq.RFQItems.Count(i => i.Id != request.RFQItemId) == 0)
        {
            rfq.ModeOfProcurementId = null;
        }
 
        unitOfWork.RFQRepository.Update(rfq);
        await unitOfWork.SaveChangesAsync(cancellationToken);
 
        return ApiResponse<bool>.Success(true);
    }
}
