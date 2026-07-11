using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Commands.UpdatePR;

public class UpdatePRCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdatePRCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdatePRCommand request, CancellationToken cancellationToken)
    {
        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var pr = await unitOfWork.PurchaseRequestRepository.GetPRWithDetailsAsync(request.Id, cancellationToken)
                ?? throw new NotFoundException($"Purchase Request with ID {request.Id} not found.");

            if (pr.Status != StatusEnum.Draft && pr.Status != StatusEnum.Returned)
                throw new ValidationException($"Cannot update Purchase Request in {pr.Status} status.");

            var dto = request.Dto;

            if (dto.PRNumber is not null)              pr.PRNumber              = dto.PRNumber;
            if (dto.Description is not null)           pr.Description           = dto.Description;
            if (dto.Purpose is not null)               pr.Purpose               = dto.Purpose;
            if (dto.FundSourceId is not null)         pr.FundSourceId         = dto.FundSourceId;
            if (dto.UACSCodeCombinationId is not null) pr.UACSCodeCombinationId = dto.UACSCodeCombinationId;
            if (dto.ProcurementCategoryId is not null) pr.ProcurementCategoryId = dto.ProcurementCategoryId;
            if (dto.RequestedDate is not null)         pr.RequestedDate         = dto.RequestedDate.Value;

            if (dto.Items is not null)
            {
                unitOfWork.PRItemRepository.RemoveRange(pr.PRItems.ToList());
                pr.PRItems.Clear();
                decimal total = 0;

                foreach (var itemReq in dto.Items)
                {
                    // Resolve PPMPItemId: for APR items (out-of-stock), the FE may only
                    // send APRItemId. In that case look up the APRItem to get its PPMPItemId.
                    Guid resolvedPpmpItemId;
                    if (itemReq.PPMPItemId.HasValue)
                    {
                        resolvedPpmpItemId = itemReq.PPMPItemId.Value;
                    }
                    else if (itemReq.APRItemId.HasValue)
                    {
                        var aprItem = await unitOfWork.APRItemRepository.GetByIdAsync(
                            itemReq.APRItemId.Value, cancellationToken)
                            ?? throw new NotFoundException(
                                $"APR Item with ID {itemReq.APRItemId} not found.");
                        resolvedPpmpItemId = aprItem.PPMPItemId;
                    }
                    else
                    {
                        throw new ValidationException(
                            "Each item must have either a PPMPItemId or an APRItemId.");
                    }

                    var item = new PRItem
                    {
                        PPMPItemId        = resolvedPpmpItemId,
                        APRItemId         = itemReq.APRItemId,
                        Name              = itemReq.Name,
                        Description       = itemReq.Description,
                        UnitCost          = itemReq.UnitCost,
                        RequestedQuantity = itemReq.RequestedQuantity,
                        Amount            = itemReq.RequestedQuantity * itemReq.UnitCost,
                        StockNo           = itemReq.StockNo,
                        IsNonCSE          = itemReq.IsNonCSE,
                        MonthlyQuantities = itemReq.MonthlyQuantities
                            .Select(kvp => new PRItemMonthlyQuantity { Month = kvp.Key, Quantity = kvp.Value })
                            .ToList()
                    };

                    pr.PRItems.Add(item);
                    total += item.Amount;
                }

                pr.TotalAmount = total;
            }

            // The entity is already tracked by EF Core, so we don't need to call Update() 
            // which would mark all navigation properties as modified.
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }, cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Purchase Request updated successfully.");
    }
}