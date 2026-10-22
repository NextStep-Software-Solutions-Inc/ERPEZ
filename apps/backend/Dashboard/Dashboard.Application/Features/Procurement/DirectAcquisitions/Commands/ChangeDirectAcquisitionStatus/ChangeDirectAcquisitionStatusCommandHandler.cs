using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Commands.ChangeDirectAcquisitionStatus;

public class ChangeDirectAcquisitionStatusCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<ChangeDirectAcquisitionStatusCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(ChangeDirectAcquisitionStatusCommand command, CancellationToken cancellationToken)
    {
        var da = await unitOfWork.DirectAcquisitionRepository.GetByIdAsync(command.DirectAcquisitionId, cancellationToken);
        if (da == null)
        {
            return ApiResponse<Unit>.Fail("Direct Acquisition record not found.");
        }

        da.Status = command.Status;
        unitOfWork.DirectAcquisitionRepository.Update(da);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Direct Acquisition status updated to {command.Status}.");
    }
}
