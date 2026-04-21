using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APPItemSchedule.Commands.UpdateAPPItemSchedule;

public class UpdateAPPItemScheduleCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateAPPItemScheduleCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(UpdateAPPItemScheduleCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.APPRepository.GetByIdAsync(request.APPId, cancellationToken)
            ?? throw new NotFoundException("APP not found.");

        var entity = await unitOfWork.APPItemScheduleRepository.GetWithDetailsAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("APP item schedule not found.");
        var appItem = await unitOfWork.APPItemRepository.GetByIdAsync(request.APPItemId, cancellationToken)
            ?? throw new NotFoundException("APP item not found.");

        if (appItem.APPId != request.APPId)
            throw new NotFoundException("APP item not found in this APP.");

        if (entity.PPMPItem?.APPItems.All(x => x.Id != request.APPItemId || x.APPId != request.APPId || x.IsDeleted) != false)
            throw new NotFoundException("APP item schedule not found for this APP item.");

        var duplicate = await unitOfWork.APPItemScheduleRepository.FindAsync(
            x => x.Id != request.Id && x.PPMPItemId == appItem.PPMPItemId && x.ProcurementActivityTypeId == request.ProcurementActivityTypeId,
            cancellationToken);
        if (duplicate is not null)
            throw new ConflictException("Schedule already exists for this PPMP item and procurement activity type.");

        entity.PPMPItemId = appItem.PPMPItemId;
        entity.ProcurementActivityTypeId = request.ProcurementActivityTypeId;
        entity.ScheduledDate = request.ScheduledDate;

        unitOfWork.APPItemScheduleRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "APP item schedule updated successfully.");
    }
}
