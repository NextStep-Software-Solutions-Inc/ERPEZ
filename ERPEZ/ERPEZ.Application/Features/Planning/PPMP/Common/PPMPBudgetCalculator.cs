using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Exceptions;

namespace ERPEZ.Application.Features.Planning.PPMP.Common;

public static class PPMPBudgetCalculator
{
    public static async Task RecalculateForPPMPItemAsync(IUnitOfWork unitOfWork, Guid ppmpItemId, CancellationToken cancellationToken)
    {
        var ppmpId = await unitOfWork.PPMPItemRepository.GetSingleAsync(
            unitOfWork.PPMPItemRepository.Query(x => x.Id == ppmpItemId)
                .Select(x => (Guid?)x.PPMPExpenditureItem.PPMPActivity.PPMPId),
            cancellationToken);

        if (!ppmpId.HasValue)
            throw new NotFoundException("PPMP for PPMP Item not found.");

        var amounts = await unitOfWork.PPMPItemAllocationRepository.ToListAsync(
            unitOfWork.PPMPItemAllocationRepository.Query(x => x.PPMPItem.PPMPExpenditureItem.PPMPActivity.PPMPId == ppmpId.Value)
                .Select(x => x.Amount),
            cancellationToken);

        var ppmp = await unitOfWork.PPMPRepository.GetByIdAsync(ppmpId.Value, cancellationToken)
            ?? throw new NotFoundException("PPMP not found.");

        ppmp.TotalEstimatedBudget = amounts.Sum();
        unitOfWork.PPMPRepository.Update(ppmp);
    }
}