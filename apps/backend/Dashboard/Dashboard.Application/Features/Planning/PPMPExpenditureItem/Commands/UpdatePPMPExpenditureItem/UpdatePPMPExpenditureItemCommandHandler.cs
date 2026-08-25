using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Commands.UpdatePPMPExpenditureItem;

public class UpdatePPMPExpenditureItemCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdatePPMPExpenditureItemCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(UpdatePPMPExpenditureItemCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.PPMPExpenditureItemRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("PPMP Expenditure Item not found.");

        var ppmp = await unitOfWork.PPMPRepository.GetByIdAsync(entity.PPMPId, cancellationToken)
            ?? throw new NotFoundException("PPMP not found.");

        if (!ppmp.LIBId.HasValue)
            throw new ValidationException("This PPMP has no LIB linked.");

        var lib = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(ppmp.LIBId.Value, cancellationToken)
            ?? throw new NotFoundException("LIB not found.");

        var targetActivityId = request.PPMPActivityId ?? entity.PPMPActivityId;
        var targetObjectId = request.ObjectId ?? entity.ObjectId;

        if (request.ObjectId.HasValue)
        {
            _ = await unitOfWork.ObjectRepository.GetByIdAsync(request.ObjectId.Value, cancellationToken)
                ?? throw new NotFoundException("Object code not found.");
        }

        if (lib.Scope == nameof(BudgetScope.ActivityLevel))
        {
            if (!targetActivityId.HasValue)
                throw new ValidationException("This LIB requires a PPMP Activity to be selected.");

            var ppmpActivity = await unitOfWork.PPMPActivityRepository.GetByIdAsync(targetActivityId.Value, cancellationToken)
                ?? throw new NotFoundException("PPMP Activity not found.");

            if (ppmpActivity.PPMPId != entity.PPMPId)
                throw new BadRequestException("The selected PPMP Activity does not belong to this PPMP.");

            var objectExistsInActivity = await unitOfWork.LineItemBudgetDetailRepository.FindAsync(
                x => x.LineItemBudgetActivityId == ppmpActivity.LIBActivityId
                && x.ObjectId == targetObjectId
                && !x.IsDeleted,
                cancellationToken);

            if (objectExistsInActivity == null)
                throw new BadRequestException("The selected object code does not belong to the selected activity.");

            entity.PPMPActivityId = targetActivityId.Value;
        }
        else if (lib.Scope == nameof(BudgetScope.ProjectLevel))
        {
            if (targetActivityId.HasValue)
                throw new ValidationException("This LIB is project-level and does not use activities.");

            var objectExistsInLib = await unitOfWork.LineItemBudgetDetailRepository.FindAsync(
                x => x.LineItemBudgetId == lib.Id
                && x.ObjectId == targetObjectId
                && !x.IsDeleted,
                cancellationToken);

            if (objectExistsInLib == null)
                throw new BadRequestException("The selected object code does not belong to the selected Line Item Budget.");

            entity.PPMPActivityId = null;
        }

        if (request.ObjectId.HasValue || request.PPMPActivityId.HasValue)
        {
            var existing = await unitOfWork.PPMPExpenditureItemRepository.FindAsync(
                x => x.Id != entity.Id
                && x.PPMPId == entity.PPMPId
                && x.PPMPActivityId == entity.PPMPActivityId
                && x.ObjectId == targetObjectId
                && !x.IsDeleted,
                cancellationToken);

            if (existing != null)
                throw new ConflictException("An expenditure item for this object already exists under the selected activity.");
        }

        if (request.ObjectId.HasValue)
            entity.ObjectId = request.ObjectId.Value;

        if (request.IsProcurable.HasValue)
            entity.IsProcurable = request.IsProcurable.Value;

        if (request.TotalCost.HasValue)
            entity.TotalCost = request.TotalCost.Value;

        entity.UpdatedAt = DateTime.UtcNow;
        unitOfWork.PPMPExpenditureItemRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "PPMP Expenditure Item updated successfully.");
    }
}
