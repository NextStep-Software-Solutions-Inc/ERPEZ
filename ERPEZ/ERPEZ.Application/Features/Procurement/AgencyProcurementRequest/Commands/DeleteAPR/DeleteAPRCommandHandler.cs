using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.DeleteAPR;

public class DeleteAPRCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteAPRCommand, Unit>
{
    public async Task<Unit> Handle(DeleteAPRCommand request, CancellationToken cancellationToken)
    {
        // Load with full graph (tracked) so children are in the change tracker for cascade
        var apr = await unitOfWork.APRRepository.GetAPRWithDetailsAsync(request.Id, cancellationToken)
            ?? throw new InvalidOperationException("APR not found.");

        if (apr.Status != StatusEnum.Draft)
            throw new InvalidOperationException(
                $"Only APRs in Draft status can be deleted. Current status: {apr.Status}.");

        // Explicit cascade — soft delete is a state-flip via interceptor, not a real DB cascade,
        // so children must be marked for removal individually rather than relying on
        // DeleteBehavior.Cascade (which only applies to actual hard deletes).
        foreach (var item in apr.APRItems)
        {
            foreach (var milestone in item.APRItemMilestones)
            {
                unitOfWork.APRItemMilestoneRepository.Remove(milestone);
            }

            unitOfWork.APRItemRepository.Remove(item);
        }

        unitOfWork.APRRepository.Remove(apr);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
