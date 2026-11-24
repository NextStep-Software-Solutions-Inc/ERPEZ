using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Commands.DeleteDirectAcquisition;

public class DeleteDirectAcquisitionCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteDirectAcquisitionCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteDirectAcquisitionCommand command, CancellationToken cancellationToken)
    {
        var da = await unitOfWork.DirectAcquisitionRepository.GetByIdAsync(command.Id, cancellationToken);
        if (da == null)
        {
            return ApiResponse<Unit>.Fail("Direct Acquisition record not found.");
        }

        unitOfWork.DirectAcquisitionRepository.Remove(da);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Direct Acquisition removed successfully.");
    }
}
