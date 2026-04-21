using ERPEZ.Application.Features.Planning.APPItemSchedule.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APPItemSchedule.Queries.GetAPPItemSchedules;

public class GetAPPItemSchedulesQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetAPPItemSchedulesQuery, PaginatedApiResponse<APPItemScheduleResponse>>
{
    public async Task<PaginatedApiResponse<APPItemScheduleResponse>> Handle(GetAPPItemSchedulesQuery request, CancellationToken cancellationToken)
    {
        var (entities, totalCount) = await unitOfWork.APPItemScheduleRepository.GetAllWithDetailsAsync(
            request.SieveModel,
            cancellationToken);

        var items = entities.Select(entity => new APPItemScheduleResponse
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
        }).ToList();

        return new PaginatedApiResponse<APPItemScheduleResponse>(items, request.SieveModel.Page ?? 1, request.SieveModel.PageSize ?? 10, totalCount);
    }
}
