using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APPItem.Commands.CreateAPPItem;

public class CreateAPPItemCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateAPPItemCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateAPPItemCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.APPRepository.GetByIdAsync(request.APPId, cancellationToken)
            ?? throw new NotFoundException("APP not found.");
        _ = await unitOfWork.PPMPItemRepository.GetByIdAsync(request.PPMPItemId, cancellationToken)
            ?? throw new NotFoundException("PPMP item not found.");
        _ = await unitOfWork.ProcurementModeRepository.GetByIdAsync(request.ProcurementModeId, cancellationToken)
            ?? throw new NotFoundException("Procurement mode not found.");
        _ = await unitOfWork.FundSourceRepository.GetByIdAsync(request.FundSourceId, cancellationToken)
            ?? throw new NotFoundException("Fund source not found.");
        _ = await unitOfWork.OfficeRepository.GetByIdAsync(request.OfficeId, cancellationToken)
            ?? throw new NotFoundException("Office not found.");

        var existing = await unitOfWork.APPItemRepository.FindAsync(
            x => x.APPId == request.APPId && x.PPMPItemId == request.PPMPItemId,
            cancellationToken);
        if (existing is not null)
            throw new ConflictException("PPMP item is already attached to this APP.");

        var entity = new ERPEZ.Domain.Entities.Planning.APPItem
        {
            Id = Guid.NewGuid(),
            APPId = request.APPId,
            PPMPItemId = request.PPMPItemId,
            ProcurementModeId = request.ProcurementModeId,
            FundSourceId = request.FundSourceId,
            OfficeId = request.OfficeId,
            PAPCode = request.PAPCode,
            Remarks = request.Remarks,
            IsEarlyProcurementActivity = request.IsEarlyProcurementActivity,
            IsOutsourced = request.IsOutsourced,
            BidEvaluationCriteria = request.BidEvaluationCriteria,
            ProcurementStrategy = request.ProcurementStrategy
        };

        await unitOfWork.APPItemRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "APP item created successfully.");
    }
}
