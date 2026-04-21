using ERPEZ.Application.Features.Planning.APPItemSchedule.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APPItemSchedule.Queries.GetAPPItemScheduleById;

public class GetAPPItemScheduleByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetAPPItemScheduleByIdQuery, ApiResponse<APPItemScheduleResponse>>
{
    public async Task<ApiResponse<APPItemScheduleResponse>> Handle(GetAPPItemScheduleByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.APPItemScheduleRepository.GetWithDetailsAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("APP item schedule not found.");

        return ApiResponse<APPItemScheduleResponse>.Success(new APPItemScheduleResponse
        {
            Id = entity.Id,
            PPMPItemId = entity.PPMPItemId,
            ProcurementActivityTypeId = entity.ProcurementActivityTypeId,
            ProcurementActivityTypeName = entity.ProcurementActivityType?.Name ?? string.Empty,
            ScheduledDate = entity.ScheduledDate,
            APPItemIds = entity.PPMPItem?.APPItems.Where(x => !x.IsDeleted).Select(x => x.Id).ToList() ?? [],
            CreatedAt = entity.CreatedAt,
            CreatedBy = entity.CreatedBy,
            UpdatedAt = entity.UpdatedAt,
            UpdatedBy = entity.UpdatedBy,
            PPMPItem = entity.PPMPItem == null ? null : new APPItemSchedulePPMPItemResponse
            {
                Id = entity.PPMPItem.Id,
                PAPCode = entity.PPMPItem.PAPCode,
                Name = entity.PPMPItem.Name,
                Description = entity.PPMPItem.Description,
                Unit = entity.PPMPItem.Unit,
                UnitPrice = entity.PPMPItem.UnitPrice
            },
            ProcurementActivityType = entity.ProcurementActivityType == null ? null : new APPItemScheduleProcurementActivityTypeResponse
            {
                Id = entity.ProcurementActivityType.Id,
                Name = entity.ProcurementActivityType.Name,
                Description = entity.ProcurementActivityType.Description
            },
            APPItems = entity.PPMPItem?.APPItems
                .Where(item => !item.IsDeleted)
                .Select(item => new APPItemScheduleAPPItemResponse
                {
                    Id = item.Id,
                    APPId = item.APPId,
                    APPNumber = item.APP?.APPNumber ?? string.Empty,
                    APPName = item.APP?.Name ?? string.Empty,
                    OfficeId = item.OfficeId,
                    OfficeName = item.Office?.Name ?? string.Empty,
                    PAPCode = item.PAPCode,
                    ProcurementModelId = item.ProcurementModelId,
                    ProcurementModelName = item.ProcurementMode?.Name ?? string.Empty
                }).ToList() ?? []
        });
    }
}
