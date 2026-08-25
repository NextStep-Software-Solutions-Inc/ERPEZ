using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPExpenditureItem.Commands.CreatePPMPExpenditureItem;

public class CreatePPMPExpenditureItemCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreatePPMPExpenditureItemCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreatePPMPExpenditureItemCommand request, CancellationToken cancellationToken)
    {
        var ppmp = await unitOfWork.PPMPRepository.GetByIdAsync(request.PPMPId, cancellationToken)
            ?? throw new NotFoundException("PPMP not found.");

        if (!ppmp.LIBId.HasValue)
            throw new ValidationException("This PPMP has no LIB linked.");

        var lib = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(ppmp.LIBId.Value, cancellationToken)
            ?? throw new NotFoundException("LIB not found.");

        // Validate Object exists
        _ = await unitOfWork.ObjectRepository.GetByIdAsync(request.ObjectId, cancellationToken)
            ?? throw new NotFoundException("Object code not found.");

        // Validate activity requirement based on LIB scope
        if (lib.Scope == nameof(BudgetScope.ActivityLevel))
        {
            if (!request.PPMPActivityId.HasValue)
                throw new ValidationException("This LIB requires a PPMP Activity to be selected.");

            var ppmpActivity = await unitOfWork.PPMPActivityRepository.GetByIdAsync(request.PPMPActivityId.Value, cancellationToken)
                ?? throw new NotFoundException("PPMP Activity not found.");

            if (ppmpActivity.PPMPId != request.PPMPId)
                throw new BadRequestException("The selected PPMP Activity does not belong to this PPMP.");

            // Validate Object belongs to this LIBActivity
            var objectExistsInActivity = await unitOfWork.LineItemBudgetDetailRepository.FindAsync(
                x => x.LineItemBudgetActivityId == ppmpActivity.LIBActivityId
                && x.ObjectId == request.ObjectId
                && !x.IsDeleted,
                cancellationToken);

            if (objectExistsInActivity == null)
                throw new BadRequestException("The selected object code does not belong to the selected activity.");
        }
        else if (lib.Scope == nameof(BudgetScope.ProjectLevel))
        {
            if (request.PPMPActivityId.HasValue)
                throw new ValidationException("This LIB is project-level and does not use activities.");

            // Validate Object belongs to this Project-Level LIB
            var objectExistsInLib = await unitOfWork.LineItemBudgetDetailRepository.FindAsync(
                x => x.LineItemBudgetId == lib.Id
                && x.ObjectId == request.ObjectId
                && !x.IsDeleted,
                cancellationToken);

            if (objectExistsInLib == null)
                throw new BadRequestException("The selected object code does not belong to the selected Line Item Budget.");
        }

        // Check for duplicate
        var existing = await unitOfWork.PPMPExpenditureItemRepository.FindAsync(
            x => x.PPMPId == request.PPMPId
            && x.PPMPActivityId == request.PPMPActivityId
            && x.ObjectId == request.ObjectId
            && !x.IsDeleted,
            cancellationToken);

        if (existing != null)
            throw new ConflictException("An expenditure item for this object already exists under the selected activity.");

        var entity = new Domain.Entities.Planning.PPMPExpenditureItem
        {
            Id = Guid.NewGuid(),
            PPMPId = request.PPMPId,
            PPMPActivityId = request.PPMPActivityId,
            ObjectId = request.ObjectId,
            IsProcurable = request.IsProcurable,
            TotalCost = 0,
        };

        await unitOfWork.PPMPExpenditureItemRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "PPMP Expenditure Item created successfully.");
    }
}