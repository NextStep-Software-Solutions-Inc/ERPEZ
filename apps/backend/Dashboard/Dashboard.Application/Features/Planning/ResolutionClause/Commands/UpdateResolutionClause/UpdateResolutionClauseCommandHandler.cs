using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ResolutionClause.Commands.UpdateResolutionClause;

public class UpdateResolutionClauseCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateResolutionClauseCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateResolutionClauseCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.ResolutionClauseRepository.FindAsync(
            x => x.Id == request.Id && !x.IsDeleted,
            cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Resolution clause not found.");

        if (!string.IsNullOrWhiteSpace(request.Request.Name))
        {
            entity.Name = request.Request.Name;
        }

        if (!string.IsNullOrWhiteSpace(request.Request.Body))
        {
            entity.Body = request.Request.Body;
        }

        if (!string.IsNullOrWhiteSpace(request.Request.ClauseType))
        {
            entity.ClauseType = request.Request.ClauseType;
        }

        unitOfWork.ResolutionClauseRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Resolution clause updated successfully.");
    }
}
