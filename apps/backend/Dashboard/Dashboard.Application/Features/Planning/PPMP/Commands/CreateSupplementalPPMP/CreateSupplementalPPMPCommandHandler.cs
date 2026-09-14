using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using PpmpEntity = ERPEZ.Domain.Entities.Planning.PPMP;
using PpmpActivityEntity = ERPEZ.Domain.Entities.Planning.PPMPActivity;
using PpmpExpenditureItemEntity = ERPEZ.Domain.Entities.Planning.PPMPExpenditureItem;
using PpmpItemEntity = ERPEZ.Domain.Entities.Planning.PPMPItem;
using PpmpItemAllocationEntity = ERPEZ.Domain.Entities.Planning.PPMPItemAllocation;

namespace ERPEZ.Application.Features.Planning.PPMP.Commands.CreateSupplementalPPMP;

public class CreateSupplementalPPMPCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateSupplementalPPMPCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateSupplementalPPMPCommand request, CancellationToken cancellationToken)
    {
        // 1. Fetch Source PPMP with all relations
        var sourcePPMP = await unitOfWork.PPMPRepository.GetPPMPWithDetailsAsync(request.SourcePPMPId, cancellationToken)
            ?? throw new NotFoundException($"Source PPMP '{request.SourcePPMPId}' not found.");

        if (sourcePPMP.IsDeleted)
            throw new NotFoundException($"Source PPMP '{request.SourcePPMPId}' not found.");

        // 2. Validate Source PPMP must be Approved and Final
        if (sourcePPMP.Status != StatusEnum.Approved)
            throw new ValidationException($"Source PPMP '{sourcePPMP.PPMPNumber}' must be approved before a Supplemental PPMP can be created. Current status: '{sourcePPMP.Status}'.");

        if (!sourcePPMP.IsFinal)
            throw new ValidationException($"Source PPMP '{sourcePPMP.PPMPNumber}' must be marked as Final before a Supplemental PPMP can be created.");

        // 3. Strict Star Lineage: Only Original PPMPs can be the source of a Supplemental PPMP
        if (sourcePPMP.PPMPType != PPMPTypeEnum.Original)
            throw new ValidationException("A Supplemental PPMP can only be created from an Original PPMP. Creating supplementals from another supplemental is not permitted.");

        // 4. Determine next sequence number for this source PPMP
        var existingSupplementals = await unitOfWork.PPMPRepository.FindAllAsync(
            p => p.SourcePPMPId == sourcePPMP.Id && !p.IsDeleted,
            cancellationToken);
        var nextSupplementalNumber = existingSupplementals.Count + 1;

        // 5. Determine PPMP number
        var rawNumber = !string.IsNullOrWhiteSpace(request.Dto?.PPMPNumber)
            ? request.Dto.PPMPNumber.Trim()
            : $"{sourcePPMP.PPMPNumber}-SUP-{nextSupplementalNumber:D3}";

        if (rawNumber.StartsWith("SUPPLEMENTAL ", StringComparison.OrdinalIgnoreCase))
            rawNumber = rawNumber["SUPPLEMENTAL ".Length..].Trim();
        else if (rawNumber.StartsWith("SUPPLEMENTAL-", StringComparison.OrdinalIgnoreCase))
            rawNumber = rawNumber["SUPPLEMENTAL-".Length..].Trim();

        var targetPpmpNumber = rawNumber;

        // 6. Check for duplicate PPMPNumber in the same fiscal year (Version = 1)
        var duplicate = await unitOfWork.PPMPRepository.FindAsync(
            p => p.PPMPNumber == targetPpmpNumber && p.FiscalYearId == sourcePPMP.FiscalYearId && p.Version == 1 && !p.IsDeleted,
            cancellationToken);

        if (duplicate != null)
            throw new ConflictException($"PPMP number '{targetPpmpNumber}' already exists for this fiscal year.");

        var copyItems = request.Dto?.CopyItems ?? false;

        // 7. Create new Supplemental PPMP header
        var supplementalPPMP = new PpmpEntity
        {
            OfficeId = sourcePPMP.OfficeId,
            FiscalYearId = sourcePPMP.FiscalYearId,
            FundSourceId = sourcePPMP.FundSourceId,
            LIBId = sourcePPMP.LIBId,
            PPMPNumber = targetPpmpNumber,
            Description = !string.IsNullOrWhiteSpace(request.Dto?.Description)
                ? request.Dto.Description.Trim()
                : $"Supplemental PPMP for {sourcePPMP.PPMPNumber}",
            Status = StatusEnum.Draft,
            Version = 1,
            IsFinal = true,
            IsMaster = sourcePPMP.IsMaster,
            PPMPType = PPMPTypeEnum.Supplemental,
            SourcePPMPId = sourcePPMP.Id,
            SupplementalNumber = nextSupplementalNumber,
            TotalEstimatedBudget = 0m
        };

        await unitOfWork.PPMPRepository.AddAsync(supplementalPPMP, cancellationToken);

        // 8. Clone Activities (with remapped IDs)
        var activityMap = new Dictionary<Guid, Guid>();
        foreach (var srcAct in sourcePPMP.PPMPActivities.Where(a => !a.IsDeleted))
        {
            var newAct = new PpmpActivityEntity
            {
                PPMPId = supplementalPPMP.Id,
                LIBActivityId = srcAct.LIBActivityId
            };
            await unitOfWork.PPMPActivityRepository.AddAsync(newAct, cancellationToken);
            activityMap[srcAct.Id] = newAct.Id;
        }

        // 9. Clone Expenditure Items (with remapped IDs)
        var sourceExpenditures = sourcePPMP.PPMPExpenditureItems.Where(e => !e.IsDeleted).ToList();
        var expenditureMap = new Dictionary<Guid, Guid>();

        foreach (var srcExp in sourceExpenditures)
        {
            Guid? remappedActivityId = null;
            if (srcExp.PPMPActivityId.HasValue && activityMap.TryGetValue(srcExp.PPMPActivityId.Value, out var newActId))
            {
                remappedActivityId = newActId;
            }

            var newExp = new PpmpExpenditureItemEntity
            {
                PPMPId = supplementalPPMP.Id,
                PPMPActivityId = remappedActivityId,
                ObjectId = srcExp.ObjectId,
                IsProcurable = srcExp.IsProcurable,
                TotalCost = copyItems ? srcExp.TotalCost : 0m
            };
            await unitOfWork.PPMPExpenditureItemRepository.AddAsync(newExp, cancellationToken);
            expenditureMap[srcExp.Id] = newExp.Id;
        }

        // 10. Clone Items and Allocations if CopyItems == true
        if (copyItems)
        {
            decimal runningTotalBudget = 0m;
            var sourceItems = sourceExpenditures.SelectMany(e => e.PPMPItems.Where(i => !i.IsDeleted)).ToList();

            foreach (var srcItem in sourceItems)
            {
                if (!expenditureMap.TryGetValue(srcItem.PPMPExpenditureItemId, out var newExpId))
                    continue;

                var newItem = new PpmpItemEntity
                {
                    PPMPExpenditureItemId = newExpId,
                    CSEItemId = srcItem.CSEItemId,
                    NonCSEItemId = srcItem.NonCSEItemId,
                    ProcurementModeId = srcItem.ProcurementModeId,
                    PAPCode = srcItem.PAPCode,
                    Name = srcItem.Name,
                    Description = srcItem.Description,
                    Unit = srcItem.Unit,
                    UnitPrice = srcItem.UnitPrice,
                    PlannedQuantity = srcItem.PlannedQuantity,
                    MOPOverride = srcItem.MOPOverride,
                    MOPJustification = srcItem.MOPJustification,
                    ProjectType = srcItem.ProjectType,
                    PreProcurementConference = srcItem.PreProcurementConference,
                    ProcurementStartDate = srcItem.ProcurementStartDate,
                    ProcurementEndDate = srcItem.ProcurementEndDate,
                    ExpectedDeliveryStart = srcItem.ExpectedDeliveryStart,
                    ExpectedDeliveryEnd = srcItem.ExpectedDeliveryEnd,
                    Remarks = srcItem.Remarks
                };

                await unitOfWork.PPMPItemRepository.AddAsync(newItem, cancellationToken);

                var srcAllocations = srcItem.PPMPItemAllocations.Where(a => !a.IsDeleted).ToList();
                decimal itemAllocAmount = 0m;

                foreach (var srcAlloc in srcAllocations)
                {
                    var newAlloc = new PpmpItemAllocationEntity
                    {
                        PPMPItemId = newItem.Id,
                        AllocationMonth = srcAlloc.AllocationMonth,
                        Quantity = srcAlloc.Quantity,
                        Amount = srcAlloc.Amount
                    };
                    await unitOfWork.PPMPItemAllocationRepository.AddAsync(newAlloc, cancellationToken);
                    itemAllocAmount += srcAlloc.Amount;
                }

                if (itemAllocAmount > 0)
                {
                    runningTotalBudget += itemAllocAmount;
                }
                else
                {
                    var qty = newItem.PlannedQuantity > 0 ? newItem.PlannedQuantity : srcAllocations.Sum(a => a.Quantity);
                    var price = newItem.UnitPrice > 0 ? newItem.UnitPrice : 0m;
                    runningTotalBudget += qty * price;
                }
            }

            supplementalPPMP.TotalEstimatedBudget = runningTotalBudget;
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(supplementalPPMP.Id, "Supplemental PPMP created successfully.");
    }
}
