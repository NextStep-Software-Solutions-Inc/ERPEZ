using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APPItemSchedule.Commands.CreateAPPItemSchedule;

public class CreateAPPItemScheduleCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateAPPItemScheduleCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateAPPItemScheduleCommand request, CancellationToken cancellationToken)
    {
        var appItem = await unitOfWork.APPItemRepository.GetByIdAsync(request.APPItemId, cancellationToken)
            ?? throw new NotFoundException("APP item not found.");

        var existing = await unitOfWork.APPItemScheduleRepository.FindAsync(
            x => x.PPMPItemId == appItem.PPMPItemId && x.ProcurementActivityTypeId == request.ProcurementActivityTypeId,
            cancellationToken);
        if (existing is not null)
        {
            existing.ScheduledDate = request.ScheduledDate;
            existing.CustomDateText = request.CustomDateText;
            unitOfWork.APPItemScheduleRepository.Update(existing);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            return ApiResponse<Guid>.Success(existing.Id, "APP item schedule updated successfully.");
        }

        var entity = new APPProcurementSchedule
        {
            Id = Guid.NewGuid(),
            PPMPItemId = appItem.PPMPItemId,
            ProcurementActivityTypeId = request.ProcurementActivityTypeId,
            ScheduledDate = request.ScheduledDate,
            CustomDateText = request.CustomDateText
        };

        await unitOfWork.APPItemScheduleRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "APP item schedule created successfully.");
    }
}
