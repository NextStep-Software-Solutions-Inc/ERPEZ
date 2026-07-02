using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.DeleteAPR;

public class DeleteAPRCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteAPRCommand, Unit>
{
    public async Task<Unit> Handle(DeleteAPRCommand request, CancellationToken cancellationToken)
    {
        var apr = await unitOfWork.APRRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new InvalidOperationException("APR not found.");

        if (apr.Status != StatusEnum.Draft)
            throw new InvalidOperationException(
                $"Only APRs in Draft status can be deleted. Current status: {apr.Status}.");

        // Soft delete — Repository<T>.Remove sets IsDeleted via AllowHardDelete flag (defaults to soft)
        unitOfWork.APRRepository.Remove(apr);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return Unit.Value;
    }
}
