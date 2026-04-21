using ERPEZ.Application.Features.Planning.APPItem.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APPItem.Queries.GetAPPItems;

public class GetAPPItemsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetAPPItemsQuery, PaginatedApiResponse<APPItemResponse>>
{
    public async Task<PaginatedApiResponse<APPItemResponse>> Handle(GetAPPItemsQuery request, CancellationToken cancellationToken)
    {
        var (entities, totalCount) = await unitOfWork.APPItemRepository.GetAllWithDetailsAsync(
            request.SieveModel,
            cancellationToken);

        var items = entities.Select(entity => new APPItemResponse
        {
            Id = entity.Id,
            APPId = entity.APPId,
            PPMPItemId = entity.PPMPItemId,
            PPMPItemName = entity.PPMPItem?.Name ?? string.Empty,
            ProcurementModelId = entity.ProcurementModelId,
            ProcurementModelName = entity.ProcurementMode?.Name ?? string.Empty,
            FundSourceId = entity.FundSourceId,
            FundSourceName = entity.FundSource?.Name ?? string.Empty,
            OfficeId = entity.OfficeId,
            OfficeName = entity.Office?.Name ?? string.Empty,
            PAPCode = entity.PAPCode,
            Remarks = entity.Remarks,
            IsEarlyProcurementActivity = entity.IsEarlyProcurementActivity,
            IsOutsourced = entity.IsOutsourced,
            BidEvaluationCriteria = entity.BidEvaluationCriteria,
            ProcurementStrategy = entity.ProcurementStrategy,
            CreatedAt = entity.CreatedAt,
            CreatedBy = entity.CreatedBy,
            UpdatedAt = entity.UpdatedAt,
            UpdatedBy = entity.UpdatedBy
        }).ToList();

        return new PaginatedApiResponse<APPItemResponse>(items, request.SieveModel.Page ?? 1, request.SieveModel.PageSize ?? 10, totalCount);
    }
}
