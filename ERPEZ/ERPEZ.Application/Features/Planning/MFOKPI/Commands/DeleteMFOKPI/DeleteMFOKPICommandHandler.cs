using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MFOKPI.Commands.DeleteMFOKPI;

public class DeleteMFOKPICommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteMFOKPICommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteMFOKPICommand request, CancellationToken cancellationToken)
    {
        var mfokpi = await unitOfWork.MFOKPIRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("MFOKPI not found.");

        unitOfWork.MFOKPIRepository.Remove(mfokpi);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"MFOKPI with ID {request.Id} deleted successfully.");
    }
}
