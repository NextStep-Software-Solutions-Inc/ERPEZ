using ERPEZ.Application.Features.Planning.BACResolutionWhereasClause.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.BACResolutionWhereasClause.Commands.UpdateBACResolutionWhereasClause;

public class UpdateBACResolutionWhereasClauseCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateBACResolutionWhereasClauseCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateBACResolutionWhereasClauseCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.BACResolutionWhereasClauseRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("BAC resolution whereas clause not found.");

        if (request.UpdateWhereasClause.Name is not null)
            entity.Name = request.UpdateWhereasClause.Name;

        if (request.UpdateWhereasClause.Body is not null)
            entity.Body = request.UpdateWhereasClause.Body;

        unitOfWork.BACResolutionWhereasClauseRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "BAC resolution whereas clause updated successfully.");
    }
}
