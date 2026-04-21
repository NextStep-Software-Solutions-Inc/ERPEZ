using ERPEZ.Application.Features.Planning.APPItem.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APPItem.Queries.GetAPPItemById;

public class GetAPPItemByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetAPPItemByIdQuery, ApiResponse<APPItemResponse>>
{
    public async Task<ApiResponse<APPItemResponse>> Handle(GetAPPItemByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.APPItemRepository.GetWithDetailsAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("APP item not found.");

        return ApiResponse<APPItemResponse>.Success(new APPItemResponse
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
        });
    }
}
