using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPItem.Commands.CreatePPMPItem;

public class CreatePPMPItemCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<CreatePPMPItemCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreatePPMPItemCommand request, CancellationToken cancellationToken)
    {
        // Validate PPMP Expenditure Item exists
        var expenditureItem = await unitOfWork.PPMPExpenditureItemRepository.GetByIdAsync(
            request.PPMPExpenditureItemId, cancellationToken);
        if (expenditureItem == null)
            throw new NotFoundException("PPMP Expenditure Item not found.");

        // Validate CSE Item exists if provided
        if (request.CSEItemId.HasValue)
        {
            var cseItem = await unitOfWork.CSEItemRepository.GetByIdAsync(request.CSEItemId.Value, cancellationToken);
            if (cseItem == null)
                throw new NotFoundException("CSE Item not found.");
        }

        // Validate Non-CSE Item exists if provided
        if (request.NonCSEItemId.HasValue)
        {
            var nonCseItem = await unitOfWork.NonCSEItemRepository.GetByIdAsync(
                request.NonCSEItemId.Value, cancellationToken);
            if (nonCseItem == null)
                throw new NotFoundException("Non-CSE Item not found.");
        }

        // Validate Procurement Mode exists
        var procurementMode = await unitOfWork.ProcurementModeRepository.GetByIdAsync(
            request.ProcurementModeId, cancellationToken);
        if (procurementMode == null)
            throw new NotFoundException("Procurement Mode not found.");

        // Create PPMP Item
        var ppmpItem = new Domain.Entities.Planning.PPMPItem
        {
            Id = Guid.NewGuid(),
            PPMPExpenditureItemId = request.PPMPExpenditureItemId,
            CSEItemId = request.CSEItemId,
            NonCSEItemId = request.NonCSEItemId,
            ProcurementModeId = request.ProcurementModeId,
            PAPCode = request.PAPCode,
            Name = request.Name,
            Description = request.Description,
            Unit = request.Unit,
            UnitPrice = request.UnitPrice,
            MOPOverride = request.MOPOverride,
            MOPJustification = request.MOPJustification,
            CreatedAt = DateTime.UtcNow
        };

        await unitOfWork.PPMPItemRepository.AddAsync(ppmpItem, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(ppmpItem.Id, "PPMP Item created successfully.");
    }
}
