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
        // Validate PPMP exists
        var ppmp = await unitOfWork.PPMPRepository.GetByIdAsync(request.PPMPId, cancellationToken)
            ?? throw new NotFoundException("PPMP not found.");

        // Validate PPMP has a LIB linked
        if (!ppmp.LIBId.HasValue)
            throw new ValidationException("This PPMP has no LIB linked.");

        var lib = await unitOfWork.LineItemBudgetRepository.GetByIdAsync(ppmp.LIBId.Value, cancellationToken)
            ?? throw new NotFoundException("LIB not found.");

        // Validate LineItemBudgetDetail
        if (!request.LineItemBudgetDetailId.HasValue)
            throw new ValidationException("Item of Expenditure (LineItemBudgetDetail) is required.");

        var libDetail = await unitOfWork.LineItemBudgetDetailRepository.GetByIdAsync(request.LineItemBudgetDetailId.Value, cancellationToken)
            ?? throw new NotFoundException("LineItemBudgetDetail not found.");

        // Line 32 — fix LIBId → LineItemBudgetId
        if (libDetail.LineItemBudgetId != ppmp.LIBId)
            throw new BadRequestException("The selected Item of Expenditure does not belong to the LIB linked to this PPMP.");

        // Validate activity requirement based on LIB scope
        if (lib.Scope == "ActivityLevel")
        {
            if (!request.PPMPActivityId.HasValue)
                throw new ValidationException("This LIB requires a PPMP Activity to be selected.");

            var ppmpActivity = await unitOfWork.PPMPActivityRepository.GetByIdAsync(request.PPMPActivityId.Value, cancellationToken)
                ?? throw new NotFoundException("PPMP Activity not found.");

            // Validate PPMPActivity belongs to this PPMP
            if (ppmpActivity.PPMPId != request.PPMPId)
                throw new BadRequestException("The selected PPMP Activity does not belong to this PPMP.");

            // Validate LineItemBudgetDetail belongs to the selected LIBActivity
            if (libDetail.LineItemBudgetActivityId != ppmpActivity.LIBActivityId)
                throw new BadRequestException("The selected Item of Expenditure does not belong to the selected activity.");
        }
        
        if (lib.Scope == "ProjectLevel" && request.PPMPActivityId.HasValue)
            throw new ValidationException("This LIB is project-level and does not use activities.");

        // Check for duplicate — same detail under same activity/ppmp
        var existing = await unitOfWork.PPMPExpenditureItemRepository.FindAsync(
            x => x.PPMPId == request.PPMPId
              && x.PPMPActivityId == request.PPMPActivityId
              && x.LineItemBudgetDetailId == request.LineItemBudgetDetailId,
            cancellationToken);

        if (existing != null)
            throw new ConflictException("An expenditure item for this object already exists under the selected activity.");

        var entity = new Domain.Entities.Planning.PPMPExpenditureItem
        {
            Id = Guid.NewGuid(),
            PPMPId = request.PPMPId,
            PPMPActivityId = request.PPMPActivityId,
            LineItemBudgetDetailId = request.LineItemBudgetDetailId,
            IsProcurable = request.IsProcurable,
            TotalCost = 0, // computed from PPMPItemAllocations, not user input
        };

        await unitOfWork.PPMPExpenditureItemRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "PPMP Expenditure Item created successfully.");
    }
}