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

        var ppmp = await unitOfWork.PPMPRepository.GetByIdAsync(expenditureItem.PPMPId, cancellationToken);
        if (ppmp != null && ppmp.Status is Domain.Enums.StatusEnum.Submitted or Domain.Enums.StatusEnum.Approved or Domain.Enums.StatusEnum.ForApproval)
            throw new BadRequestException($"Cannot add items when PPMP status is {ppmp.Status}.");

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

        var papCode = request.PAPCode;
        if (string.IsNullOrWhiteSpace(papCode) && expenditureItem.PPMPActivityId.HasValue)
        {
            var ppmpActivity = await unitOfWork.PPMPActivityRepository.GetByIdAsync(
                expenditureItem.PPMPActivityId.Value, cancellationToken);
            if (ppmpActivity != null)
            {
                var libActivity = await unitOfWork.LineItemBudgetActivityRepository.GetByIdAsync(
                    ppmpActivity.LIBActivityId, cancellationToken);
                papCode = libActivity?.PAPCode;
            }
        }

        // Create PPMP Item
        var ppmpItem = new Domain.Entities.Planning.PPMPItem
        {
            Id = Guid.NewGuid(),
            PPMPExpenditureItemId = request.PPMPExpenditureItemId,
            CSEItemId = request.CSEItemId,
            NonCSEItemId = request.NonCSEItemId,
            ProcurementModeId = request.ProcurementModeId,
            PAPCode = papCode,
            Name = name,
            Description = description,
            Unit = unit,
            UnitPrice = unitPrice,
            PlannedQuantity = request.PlannedQuantity,
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
