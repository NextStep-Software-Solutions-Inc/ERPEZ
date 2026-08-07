using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRItemMOV.Commands.DeleteOPCRItemMOV;

public class DeleteOPCRItemMOVCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteOPCRItemMOVCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        DeleteOPCRItemMOVCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.OPCRItemMOVRepository.GetByIdAsync(
            request.Id, cancellationToken)
            ?? throw new NotFoundException("OPCR Item MOV not found.");

        unitOfWork.OPCRItemMOVRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "OPCR Item MOV deleted successfully.");
    }
}