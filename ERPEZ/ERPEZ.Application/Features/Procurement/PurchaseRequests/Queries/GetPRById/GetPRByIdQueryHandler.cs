using ERPEZ.Application.Features.Procurement.PurchaseRequests.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.PurchaseRequests.Queries.GetPRById;

public class GetPRByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPRByIdQuery, ApiResponse<PurchaseRequestDetailResponse>>
{
    public async Task<ApiResponse<PurchaseRequestDetailResponse>> Handle(
        GetPRByIdQuery query, CancellationToken cancellationToken)
    {
        var pr = await unitOfWork.PurchaseRequestRepository.GetPRWithDetailsAsync(
            query.Id, cancellationToken)
            ?? throw new NotFoundException($"Purchase Request with ID {query.Id} not found.");

        var response = new PurchaseRequestDetailResponse
        {
            Id                  = pr.Id,
            PRNumber            = pr.PRNumber,
            Description         = pr.Description,
            Purpose             = pr.Purpose,
            PRType              = pr.PRType.ToString(),
            Status              = pr.Status.ToString(),
            RequestedDate       = pr.RequestedDate,
            TotalAmount         = pr.TotalAmount,
            OfficeId            = pr.OfficeId,
            OfficeName          = pr.Office.Name,
            UACSCode            = pr.UACSCodeCombination?.CombinationCode,   // ← fix: use correct property
            FundSource          = pr.FundSource?.Name,
            ProcurementCategory = pr.ProcurementCategory?.Name,
            Items = pr.PRItems
                .Where(i => !i.IsDeleted)
                .Select(i => new PRItemDetailResponse
                {
                    Id                = i.Id,
                    PPMPItemId        = i.PPMPItemId,
                    APRItemId         = i.APRItemId,
                    Name              = i.Name,
                    Description       = i.Description,
                    StockNo           = i.StockNo,
                    IsNonCSE          = i.IsNonCSE,
                    UnitCost          = i.UnitCost,
                    RequestedQuantity = i.RequestedQuantity,
                    Amount            = i.Amount,
                    MonthlyQuantities = i.MonthlyQuantities
                        .ToDictionary(m => m.Month, m => m.Quantity)
                }).ToList()
        };

        return ApiResponse<PurchaseRequestDetailResponse>.Success(response);
    }
}