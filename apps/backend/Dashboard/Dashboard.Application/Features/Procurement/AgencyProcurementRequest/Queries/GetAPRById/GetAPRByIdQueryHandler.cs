using ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Dtos;
using ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Queries.GetAPRById;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Queries.GetAPRById;

public class GetAPRByIdQueryHandler : IRequestHandler<GetAPRByIdQuery, ApiResponse<APRDetailDto>>
{
    private readonly IUnitOfWork unitOfWork;

    public GetAPRByIdQueryHandler(IUnitOfWork unitOfWork)
    {
        this.unitOfWork = unitOfWork;
    }

    public async Task<ApiResponse<APRDetailDto>> Handle(GetAPRByIdQuery request, CancellationToken cancellationToken)
    {
        var apr = await unitOfWork.APRRepository.GetAPRWithDetailsAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("APR not found.");

        var linkedPRs = await unitOfWork.PurchaseRequestRepository.FindAllAsync(
            pr => !pr.IsDeleted &&
                  pr.PRType == ERPEZ.Domain.Enums.PRType.OutOfStockCSE &&
                  pr.Status != ERPEZ.Domain.Enums.StatusEnum.Returned &&
                  (pr.PRItems.Any(pi => pi.APRItem != null && pi.APRItem.APRId == apr.Id) ||
                   (pr.Description != null && (pr.Description.Contains(apr.APRNumber) || pr.Description.Contains(apr.Id.ToString()))) ||
                   (pr.Purpose.Contains(apr.APRNumber) || pr.Purpose.Contains(apr.Id.ToString()))),
            cancellationToken);

        var firstLinkedPR = linkedPRs.OrderByDescending(p => p.CreatedAt).FirstOrDefault();

        var aprItemIds = apr.APRItems.Select(ai => ai.Id).ToList();
        var existingPRItems = await unitOfWork.PRItemRepository.FindAllAsync(
            i => i.APRItemId != null &&
                 aprItemIds.Contains(i.APRItemId.Value) &&
                 !i.PurchaseRequest.IsDeleted &&
                 i.PurchaseRequest.Status != ERPEZ.Domain.Enums.StatusEnum.Returned,
            cancellationToken);

        var reservedByAprItem = existingPRItems
            .GroupBy(i => i.APRItemId!.Value)
            .ToDictionary(g => g.Key, g => g.Sum(i => i.RequestedQuantity));

        return ApiResponse<APRDetailDto>.Success(new APRDetailDto
        {
            Id = apr.Id,
            APRNumber = apr.APRNumber,
            APPId = apr.APPId,
            APPNumber = apr.APP.APPNumber,
            OfficeId = apr.OfficeId,
            OfficeName = apr.Office?.Name ?? string.Empty,
            FiscalYearId = apr.FiscalYearId,
            FiscalYear = apr.FiscalYear?.Year ?? 0,
            TotalAmount = apr.TotalAmount,
            Status = apr.Status,
            AgencyControlNumber = apr.AgencyControlNumber,
            AgencyAccountCode = apr.AgencyAccountCode,
            RequestDate = apr.RequestDate,
            Description = apr.Description,
            ModeOfDelivery = apr.ModeOfDelivery,
            InsufficientFundsAction = apr.InsufficientFundsAction,
            RequiresObR = apr.RequiresObR,
            RequiresCBA = apr.RequiresCBA,
            RequiresCompleteSpecifications = apr.RequiresCompleteSpecifications,
            AdditionalRemarks = apr.AdditionalRemarks,
            SubmittedDate = apr.SubmittedDate,
            ApprovedDate = apr.ApprovedDate,
            ReturnedDate = apr.ReturnedDate,
            ReturnRemarks = apr.ReturnRemarks,
            ApprovedBy = apr.ApprovedBy,
            LinkedPurchaseRequestId = firstLinkedPR?.Id,
            LinkedPurchaseRequestNumber = firstLinkedPR?.PRNumber,
            LinkedPurchaseRequestStatus = firstLinkedPR?.Status.ToString(),
            LinkedPurchaseRequests = linkedPRs.Select(p => new LinkedPurchaseRequestDto
            {
                Id = p.Id,
                PRNumber = p.PRNumber,
                Status = p.Status.ToString(),
                TotalAmount = p.TotalAmount,
                CreatedAt = p.CreatedAt
            }).ToList(),
            Items = apr.APRItems.Select(item =>
            {
                var reserved = reservedByAprItem.GetValueOrDefault(item.Id, 0);
                var totalReq = (int)item.QuantityRequested;
                var deficit = Math.Max(0, totalReq - reserved);

                return new APRItemDto
                {
                    Id = item.Id,
                    APPItemId = item.APPItemId,
                    PPMPItemId = item.PPMPItemId,
                    ItemCode = item.ItemCode ?? item.PPMPItemId?.ToString() ?? string.Empty,
                    Description = item.Description ?? item.PPMPItem?.Name ?? item.APPItem?.PPMPItem?.Name ?? string.Empty,
                    Unit = item.Unit ?? item.PPMPItem?.Unit ?? item.APPItem?.PPMPItem?.Unit ?? string.Empty,
                    QuantityRequested = item.QuantityRequested,
                    UnitCost = item.UnitCost,
                    TotalCost = item.TotalCost,
                    FulfilledQuantity = reserved,
                    Deficit = deficit,
                    Milestones = item.APRItemMilestones.Select(m => new APRItemMilestoneDto
                    {
                        Id = m.Id,
                        ProcurementActivityTypeId = m.ProcurementActivityTypeId,
                        ProcurementActivityTypeName = m.ProcurementActivityType?.Name ?? string.Empty,
                        ScheduledDate = m.ScheduledDate,
                        Remarks = m.Remarks
                    }).ToList()
                };
            }).ToList()
        }, "APR retrieved successfully.");
    }
}
