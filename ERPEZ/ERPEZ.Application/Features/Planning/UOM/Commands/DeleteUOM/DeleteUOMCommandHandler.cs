using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UOM.Commands.DeleteUOM;

public class DeleteUOMCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteUOMCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteUOMCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.UOMRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("UOM not found.");

        // Check if in use
        var isInUse = await unitOfWork.UOMRepository.IsInUseAsync(request.Id, cancellationToken);

        if (isInUse)
            throw new ConflictException("Cannot delete UOM that is assigned to procurement items.");

        // Check if has children
        var hasChildren = await unitOfWork.UOMRepository.HasChildrenAsync(request.Id, cancellationToken);

        if (hasChildren)
            throw new ConflictException("Cannot delete UOM that has child UOMs.");

        unitOfWork.UOMRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "UOM deleted successfully.");
    }
}
