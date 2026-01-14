using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRActivityMOV.Commands.DeleteOPCRActivityMOV;

public class DeleteOPCRActivityMOVCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteOPCRActivityMOVCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteOPCRActivityMOVCommand request, CancellationToken cancellationToken)
    {
        var mov = await unitOfWork.OPCRActivityMOVRepository.GetByIdAsync(
            request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("OPCR Activity MOV not found.");

        unitOfWork.OPCRActivityMOVRepository.Delete(mov);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "OPCR Activity MOV deleted successfully.");
    }
}
