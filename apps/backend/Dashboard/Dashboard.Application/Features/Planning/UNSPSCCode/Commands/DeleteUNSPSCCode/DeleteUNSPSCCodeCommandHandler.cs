using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.UNSPSCCode.Commands.DeleteUNSPSCCode;

public class DeleteUNSPSCCodeCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteUNSPSCCodeCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteUNSPSCCodeCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.UNSPSCCodeRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("UNSPSC code not found.");

        // Check if in use
        var isInUse = await unitOfWork.UNSPSCCodeRepository.IsInUseAsync(request.Id, cancellationToken);

        if (isInUse)
            throw new ConflictException("Cannot delete UNSPSC code that is assigned to procurement items.");

        // Check if has children
        var hasChildren = await unitOfWork.UNSPSCCodeRepository.HasChildrenAsync(request.Id, cancellationToken);

        if (hasChildren)
            throw new ConflictException("Cannot delete UNSPSC code that has child codes.");

        unitOfWork.UNSPSCCodeRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "UNSPSC code deleted successfully.");
    }
}
