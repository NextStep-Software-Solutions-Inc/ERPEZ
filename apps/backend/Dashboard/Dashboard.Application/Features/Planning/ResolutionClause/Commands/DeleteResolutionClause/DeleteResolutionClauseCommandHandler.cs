using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ResolutionClause.Commands.DeleteResolutionClause;

public class DeleteResolutionClauseCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteResolutionClauseCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteResolutionClauseCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.ResolutionClauseRepository.FindAsync(
            x => x.Id == request.Id && !x.IsDeleted,
            cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Resolution clause not found.");

        entity.IsDeleted = true;
        unitOfWork.ResolutionClauseRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Resolution clause deleted successfully.");
    }
}
