using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.MFOPAP.Commands.DeleteMFOPAP;

public class DeleteMFOPAPCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteMFOPAPCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteMFOPAPCommand request, CancellationToken cancellationToken)
    {
        var mfoPAP = await unitOfWork.MFOPAPRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("MFOPAP not found.");

        unitOfWork.MFOPAPRepository.Remove(mfoPAP);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"MFOPAP with ID {request.Id} deleted successfully.");
    }
}
