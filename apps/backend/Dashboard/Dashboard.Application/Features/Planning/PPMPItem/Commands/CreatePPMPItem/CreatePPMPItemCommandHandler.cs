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
        Domain.Entities.Planning.ProcurementItem? procurementItem = null;
        if (request.CSEItemId.HasValue)
        {
            procurementItem = await unitOfWork.ProcurementItemRepository.FindAsync(
                x => x.Id == request.CSEItemId.Value && x.IsCSE, cancellationToken);
            if (procurementItem == null)
                throw new NotFoundException("CSE Item not found.");
        }

        // Validate Non-CSE Item exists if provided
        Domain.Entities.Planning.NonCSEItem? nonCseItem = null;
        if (request.NonCSEItemId.HasValue)
        {
            nonCseItem = await unitOfWork.NonCSEItemRepository.GetByIdAsync(
                request.NonCSEItemId.Value, cancellationToken);
            if (nonCseItem == null)
                throw new NotFoundException("Non-CSE Item not found.");
        }

        // Validate Procurement Mode exists
        var procurementMode = await unitOfWork.ProcurementModeRepository.GetByIdAsync(
            request.ProcurementModeId, cancellationToken);
        if (procurementMode == null)
            throw new NotFoundException("Procurement Mode not found.");

        // Resolve name, unit, unitPrice from item if not provided
        var name = procurementItem?.Name ?? nonCseItem?.Name ?? request.Name ?? string.Empty;
        var description = procurementItem?.Specifications ?? nonCseItem?.Description ?? request.Description;
        var unit = procurementItem?.UOM?.Name ?? nonCseItem?.UOM?.Name ?? request.Unit ?? string.Empty;
        var unitPrice = procurementItem != null
            ? (request.UnitPrice > 0 ? request.UnitPrice : 0m)
            : nonCseItem?.CurrentPrice > 0 ? nonCseItem.CurrentPrice : request.UnitPrice;

        // Create PPMP Item
        var ppmpItem = new Domain.Entities.Planning.PPMPItem
        {
            Id = Guid.NewGuid(),
            PPMPExpenditureItemId = request.PPMPExpenditureItemId,
            CSEItemId = request.CSEItemId,
            NonCSEItemId = request.NonCSEItemId,
            ProcurementModeId = request.ProcurementModeId,
            PAPCode = request.PAPCode,
            Name = name,
            Description = description,
            Unit = unit,
            UnitPrice = unitPrice,
            MOPOverride = request.MOPOverride,
            MOPJustification = request.MOPJustification,
            ProjectType               = request.ProjectType,
            PreProcurementConference  = request.PreProcurementConference,
            ProcurementStartDate      = request.ProcurementStartDate,
            ProcurementEndDate        = request.ProcurementEndDate,
            ExpectedDeliveryStart     = request.ExpectedDeliveryStart,
            ExpectedDeliveryEnd       = request.ExpectedDeliveryEnd,
            Remarks                   = request.Remarks,
        };

        await unitOfWork.PPMPItemRepository.AddAsync(ppmpItem, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(ppmpItem.Id, "PPMP Item created successfully.");
    }
}
