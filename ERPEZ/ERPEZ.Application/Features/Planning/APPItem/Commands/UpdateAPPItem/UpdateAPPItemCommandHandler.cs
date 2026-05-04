using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APPItem.Commands.UpdateAPPItem;

public class UpdateAPPItemCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateAPPItemCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(UpdateAPPItemCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.APPRepository.GetByIdAsync(request.APPId, cancellationToken)
            ?? throw new NotFoundException("APP not found.");

        var entity = await unitOfWork.APPItemRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("APP item not found.");

        if (entity.APPId != request.APPId)
            throw new NotFoundException("APP item not found in this APP.");

        _ = await unitOfWork.PPMPItemRepository.GetByIdAsync(request.PPMPItemId, cancellationToken)
            ?? throw new NotFoundException("PPMP item not found.");
        _ = await unitOfWork.ProcurementModeRepository.GetByIdAsync(request.ProcurementModeId, cancellationToken)
            ?? throw new NotFoundException("Procurement mode not found.");
        _ = await unitOfWork.FundSourceRepository.GetByIdAsync(request.FundSourceId, cancellationToken)
            ?? throw new NotFoundException("Fund source not found.");
        _ = await unitOfWork.OfficeRepository.GetByIdAsync(request.OfficeId, cancellationToken)
            ?? throw new NotFoundException("Office not found.");

        var duplicate = await unitOfWork.APPItemRepository.FindAsync(
            x => x.APPId == request.APPId && x.PPMPItemId == request.PPMPItemId && x.Id != request.Id,
            cancellationToken);
        if (duplicate is not null)
            throw new ConflictException("PPMP item is already attached to this APP.");

        entity.PPMPItemId = request.PPMPItemId;
        entity.ProcurementModeId = request.ProcurementModeId;
        entity.FundSourceId = request.FundSourceId;
        entity.OfficeId = request.OfficeId;
        entity.PAPCode = request.PAPCode;
        entity.Remarks = request.Remarks;
        entity.IsEarlyProcurementActivity = request.IsEarlyProcurementActivity;
        entity.IsOutsourced = request.IsOutsourced;
        entity.BidEvaluationCriteria = request.BidEvaluationCriteria;
        entity.ProcurementStrategy = request.ProcurementStrategy;

        unitOfWork.APPItemRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "APP item updated successfully.");
    }
}
