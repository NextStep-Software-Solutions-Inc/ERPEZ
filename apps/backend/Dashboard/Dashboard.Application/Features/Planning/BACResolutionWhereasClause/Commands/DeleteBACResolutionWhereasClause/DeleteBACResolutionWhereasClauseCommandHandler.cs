using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.BACResolutionWhereasClause.Commands.DeleteBACResolutionWhereasClause;

public class DeleteBACResolutionWhereasClauseCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteBACResolutionWhereasClauseCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteBACResolutionWhereasClauseCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.BACResolutionWhereasClauseRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("BAC resolution whereas clause not found.");

        unitOfWork.BACResolutionWhereasClauseRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "BAC resolution whereas clause deleted successfully.");
    }
}
