using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PPMPItem.Commands.UpdatePPMPItem;

public class UpdatePPMPItemCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<UpdatePPMPItemCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(UpdatePPMPItemCommand request, CancellationToken cancellationToken)
    {
        // Get existing PPMP Item
        var ppmpItem = await unitOfWork.PPMPItemRepository.GetByIdAsync(request.Id, cancellationToken);
        if (ppmpItem == null)
            throw new NotFoundException("PPMP Item not found.");

        // Validate PPMP Expenditure Item exists if provided
        if (request.PPMPExpenditureItemId.HasValue)
        {
            var expenditureItem = await unitOfWork.PPMPExpenditureItemRepository.GetByIdAsync(
                request.PPMPExpenditureItemId.Value, cancellationToken);
            if (expenditureItem == null)
                throw new NotFoundException("PPMP Expenditure Item not found.");
            
            ppmpItem.PPMPExpenditureItemId = request.PPMPExpenditureItemId.Value;
        }

        // Validate CSE Item exists if provided
        if (request.CSEItemId.HasValue)
        {
            var procurementItem = await unitOfWork.ProcurementItemRepository.FindAsync(
                x => x.Id == request.CSEItemId.Value && x.IsCSE, cancellationToken);
            if (procurementItem == null)
                throw new NotFoundException("CSE Item not found.");

            ppmpItem.CSEItemId = request.CSEItemId.Value;
            ppmpItem.NonCSEItemId = null; // Clear NonCSEItemId if CSEItemId is set
        }

        // Validate Non-CSE Item exists if provided
        if (request.NonCSEItemId.HasValue)
        {
            var nonCseItem = await unitOfWork.NonCSEItemRepository.GetByIdAsync(
                request.NonCSEItemId.Value, cancellationToken);
            if (nonCseItem == null)
                throw new NotFoundException("Non-CSE Item not found.");
            
            ppmpItem.NonCSEItemId = request.NonCSEItemId.Value;
            ppmpItem.CSEItemId = null; // Clear CSEItemId if NonCSEItemId is set
        }

        // Validate Procurement Mode exists if provided
        if (request.ProcurementModeId.HasValue)
        {
            var procurementMode = await unitOfWork.ProcurementModeRepository.GetByIdAsync(
                request.ProcurementModeId.Value, cancellationToken);
            if (procurementMode == null)
                throw new NotFoundException("Procurement Mode not found.");
            
            ppmpItem.ProcurementModeId = request.ProcurementModeId.Value;
        }

        // Update properties
        if (request.PAPCode != null)
            ppmpItem.PAPCode = request.PAPCode;

        if (request.Name != null)
            ppmpItem.Name = request.Name;

        if (request.Description != null)
            ppmpItem.Description = request.Description;

        if (request.Unit != null)
            ppmpItem.Unit = request.Unit;

        if (request.UnitPrice.HasValue)
            ppmpItem.UnitPrice = request.UnitPrice.Value;

        if (request.MOPOverride.HasValue)
            ppmpItem.MOPOverride = request.MOPOverride.Value;

        if (request.MOPJustification != null)
            ppmpItem.MOPJustification = request.MOPJustification;

        // ── New field updates ────────────────────────────────────────────────
        if (request.ProjectType.HasValue)              ppmpItem.ProjectType             = request.ProjectType.Value;
        ppmpItem.PreProcurementConference = request.PreProcurementConference;
        ppmpItem.ProcurementStartDate    = request.ProcurementStartDate;
        ppmpItem.ProcurementEndDate      = request.ProcurementEndDate;
        ppmpItem.ExpectedDeliveryStart   = request.ExpectedDeliveryStart;
        ppmpItem.ExpectedDeliveryEnd     = request.ExpectedDeliveryEnd;
        if (request.Remarks != null)                   ppmpItem.Remarks                 = request.Remarks;

        ppmpItem.UpdatedAt = DateTime.UtcNow;

        unitOfWork.PPMPItemRepository.Update(ppmpItem);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(ppmpItem.Id, "PPMP Item updated successfully.");
    }
}
