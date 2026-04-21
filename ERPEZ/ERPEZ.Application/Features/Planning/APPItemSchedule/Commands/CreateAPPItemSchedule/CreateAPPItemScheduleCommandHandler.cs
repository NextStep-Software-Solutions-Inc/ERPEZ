using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using APPItemScheduleEntity = ERPEZ.Domain.Entities.Planning.APPProcurementSchedule;

namespace ERPEZ.Application.Features.Planning.APPItemSchedule.Commands.CreateAPPItemSchedule;

public class CreateAPPItemScheduleCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateAPPItemScheduleCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateAPPItemScheduleCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.APPRepository.GetByIdAsync(request.APPId, cancellationToken)
            ?? throw new NotFoundException("APP not found.");

        var appItem = await unitOfWork.APPItemRepository.GetByIdAsync(request.APPItemId, cancellationToken)
            ?? throw new NotFoundException("APP item not found.");

        if (appItem.APPId != request.APPId)
            throw new NotFoundException("APP item not found in this APP.");

        var existing = await unitOfWork.APPItemScheduleRepository.FindAsync(
            x => x.PPMPItemId == appItem.PPMPItemId && x.ProcurementActivityTypeId == request.ProcurementActivityTypeId,
            cancellationToken);
        if (existing is not null)
            throw new ConflictException("Schedule already exists for this PPMP item and procurement activity type.");

        var entity = new APPItemScheduleEntity
        {
            Id = Guid.NewGuid(),
            PPMPItemId = appItem.PPMPItemId,
            ProcurementActivityTypeId = request.ProcurementActivityTypeId,
            ScheduledDate = request.ScheduledDate
        };

        await unitOfWork.APPItemScheduleRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "APP item schedule created successfully.");
    }
}
