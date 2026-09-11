using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.APPItem.Commands.CreateAPPItem;

public class CreateAPPItemCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateAPPItemCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateAPPItemCommand request, CancellationToken cancellationToken)
    {
        var app = await unitOfWork.APPRepository.GetByIdAsync(request.APPId, cancellationToken)
            ?? throw new NotFoundException("APP not found.");
        var ppmpItem = await unitOfWork.PPMPItemRepository.GetByIdWithDetailsAsync(request.PPMPItemId, cancellationToken)
            ?? await unitOfWork.PPMPItemRepository.GetByIdAsync(request.PPMPItemId, cancellationToken)
            ?? throw new NotFoundException("PPMP item not found.");

        var fundSourceId = request.FundSourceId != Guid.Empty
            ? request.FundSourceId
            : (ppmpItem.PPMPExpenditureItem?.PPMPActivity?.PPMP?.FundSourceId 
               ?? ppmpItem.PPMPExpenditureItem?.PPMP?.FundSourceId 
               ?? Guid.Empty);

        var officeId = request.OfficeId != Guid.Empty
            ? request.OfficeId
            : (ppmpItem.PPMPExpenditureItem?.PPMPActivity?.PPMP?.OfficeId 
               ?? ppmpItem.PPMPExpenditureItem?.PPMP?.OfficeId 
               ?? Guid.Empty);

        _ = await unitOfWork.ProcurementModeRepository.GetByIdAsync(request.ProcurementModeId, cancellationToken)
            ?? throw new NotFoundException("Procurement mode not found.");
        _ = await unitOfWork.FundSourceRepository.GetByIdAsync(fundSourceId, cancellationToken)
            ?? throw new NotFoundException("Fund source not found.");
        _ = await unitOfWork.OfficeRepository.GetByIdAsync(officeId, cancellationToken)
            ?? throw new NotFoundException("Office not found.");

        var existing = await unitOfWork.APPItemRepository.FindAsync(
            x => x.APPId == request.APPId && x.PPMPItemId == request.PPMPItemId,
            cancellationToken);
        if (existing is not null)
            throw new ConflictException("PPMP item is already attached to this APP.");

        var isNewItem = string.Equals(app.APPType, "Updated", StringComparison.OrdinalIgnoreCase);

        var entity = new ERPEZ.Domain.Entities.Planning.APPItem
        {
            Id = Guid.NewGuid(),
            APPId = request.APPId,
            PPMPItemId = request.PPMPItemId,
            ProcurementModeId = request.ProcurementModeId,
            FundSourceId = fundSourceId,
            OfficeId = officeId,
            PAPCode = request.PAPCode,
            Remarks = request.Remarks,
            ItemNameOverride = request.ItemNameOverride,
            GeneralDescription = request.GeneralDescription,
            IsEarlyProcurementActivity = request.IsEarlyProcurementActivity,
            EPARemarks = request.EPARemarks,
            IsOutsourced = request.IsOutsourced,
            BidEvaluationCriteria = request.BidEvaluationCriteria != null ? Enum.Parse<BidEvaluationCriteria>(request.BidEvaluationCriteria, true) : null,
            ProcurementStrategies = request.ProcurementStrategies?.Select(x => Enum.Parse<ProcurementStrategy>(x, true)).ToList(),
            StartOfProcurementOverride = request.StartOfProcurementOverride,
            EndOfProcurementOverride = request.EndOfProcurementOverride,
            EstimatedBudgetOverride = request.EstimatedBudgetOverride,
            IsNew = isNewItem,
            IsRevised = false
        };

        await unitOfWork.APPItemRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "APP item created successfully.");
    }
}
