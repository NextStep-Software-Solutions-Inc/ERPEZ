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

        var effectiveStart = entity.StartOfProcurementOverride ?? (entity.PPMPItem?.ProcurementStartDate.HasValue == true ? entity.PPMPItem.ProcurementStartDate.Value.ToDateTime(TimeOnly.MinValue) : null);
        var effectiveEnd = entity.EndOfProcurementOverride ?? (entity.PPMPItem?.ProcurementEndDate.HasValue == true ? entity.PPMPItem.ProcurementEndDate.Value.ToDateTime(TimeOnly.MinValue) : null);

        return ApiResponse<APPItemResponse>.Success(new APPItemResponse
        {
            Id = entity.Id,
            APPId = entity.APPId,
            PPMPItemId = entity.PPMPItemId,
            PPMPItemName = entity.PPMPItem?.Name ?? string.Empty,
            ProcurementModeId = entity.ProcurementModeId,
            ProcurementModeName = entity.ProcurementMode?.Name ?? string.Empty,
            FundSourceId = entity.FundSourceId,
            FundSourceName = entity.FundSource?.Name ?? string.Empty,
            OfficeId = entity.OfficeId,
            OfficeName = entity.Office?.Name ?? string.Empty,
            PAPCode = entity.PAPCode,
            Remarks = entity.Remarks,
            IsEarlyProcurementActivity = entity.IsEarlyProcurementActivity,
            IsOutsourced = entity.IsOutsourced,
            BidEvaluationCriteria = entity.BidEvaluationCriteria,
            ProcurementStrategies = entity.ProcurementStrategies,
            CreatedAt = entity.CreatedAt,
            CreatedBy = entity.CreatedBy,
            UpdatedAt = entity.UpdatedAt,
            UpdatedBy = entity.UpdatedBy,
            EffectiveStartOfProcurement = effectiveStart,
            EffectiveEndOfProcurement = effectiveEnd,
            StartOfProcurementOverride = entity.StartOfProcurementOverride,
            EndOfProcurementOverride = entity.EndOfProcurementOverride,
            EstimatedBudgetOverride = entity.EstimatedBudgetOverride,
            OriginalPPMPBudget = entity.OriginalPPMPBudget,
            EffectiveABC = entity.EffectiveABC,
            IsABCOverridden = entity.EstimatedBudgetOverride.HasValue,
            IsStartProcurementOverridden = entity.StartOfProcurementOverride.HasValue,
            IsEndProcurementOverridden = entity.EndOfProcurementOverride.HasValue,
            IsNew = entity.IsNew,
            IsRevised = entity.IsRevised,
            APP = entity.APP == null ? null : new APPItemAPPResponse
            {
                Id = entity.APP.Id,
                APPNumber = entity.APP.APPNumber,
                Name = entity.APP.Name
            },
            PPMPItem = entity.PPMPItem == null ? null : new APPItemPPMPItemResponse
            {
                Id = entity.PPMPItem.Id,
                PAPCode = entity.PPMPItem.PAPCode,
                Name = entity.PPMPItem.Name,
                Description = entity.PPMPItem.Description,
                Unit = entity.PPMPItem.Unit,
                UnitPrice = entity.PPMPItem.UnitPrice
            },
            ProcurementMode = entity.ProcurementMode == null ? null : new APPItemProcurementModeResponse
            {
                Id = entity.ProcurementMode.Id,
                Name = entity.ProcurementMode.Name,
                Description = entity.ProcurementMode.Description
            },
            FundSource = entity.FundSource == null ? null : new APPItemFundSourceResponse
            {
                Id = entity.FundSource.Id,
                Name = entity.FundSource.Name,
                Code = entity.FundSource.Code
            },
            Office = entity.Office == null ? null : new APPItemOfficeResponse
            {
                Id = entity.Office.Id,
                Name = entity.Office.Name,
                Code = entity.Office.Code
            },
            Schedules = entity.PPMPItem?.APPProcurementSchedules
                .Where(schedule => !schedule.IsDeleted)
                .Select(schedule => new APPItemScheduleReferenceResponse
                {
                    Id = schedule.Id,
                    ProcurementActivityTypeId = schedule.ProcurementActivityTypeId,
                    ProcurementActivityTypeName = schedule.ProcurementActivityType?.Name ?? string.Empty,
                    ScheduledDate = schedule.ScheduledDate,
                    CustomDateText = schedule.CustomDateText
                }).ToList() ?? []
        });
    }
}
