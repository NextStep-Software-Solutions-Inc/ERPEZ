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

            if (dto.Description is not null)           pr.Description           = dto.Description;
            if (dto.Purpose is not null)               pr.Purpose               = dto.Purpose;
            if (dto.FundSourceId is not null)         pr.FundSourceId         = dto.FundSourceId;
            if (dto.UACSCodeCombinationId is not null) pr.UACSCodeCombinationId = dto.UACSCodeCombinationId;
            if (dto.ProcurementCategoryId is not null) pr.ProcurementCategoryId = dto.ProcurementCategoryId;
            if (dto.RequestedDate is not null)         pr.RequestedDate         = dto.RequestedDate.Value;

            if (dto.Items is not null)
            {
                pr.PRItems.Clear();
                decimal total = 0;

                foreach (var itemReq in dto.Items)
                {
                    var item = new PRItem
                    {
                        PPMPItemId        = itemReq.PPMPItemId!.Value,
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

            unitOfWork.PurchaseRequestRepository.Update(pr);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }, cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Purchase Request updated successfully.");
    }
}