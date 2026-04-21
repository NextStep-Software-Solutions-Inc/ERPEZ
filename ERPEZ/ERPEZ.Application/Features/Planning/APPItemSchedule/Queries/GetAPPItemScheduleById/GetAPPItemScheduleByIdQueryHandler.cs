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
            UpdatedBy = entity.UpdatedBy
        });
    }
}
