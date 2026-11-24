using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WorkflowMatrix.Commands.UpdateWorkflowMatrixStatus;

public class UpdateWorkflowMatrixStatusCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateWorkflowMatrixStatusCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateWorkflowMatrixStatusCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.WorkflowMatrixRepository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
            throw new NotFoundException("Workflow Matrix not found.");

        // Normalize status to proper casing
        var newStatus = char.ToUpper(request.Status[0]) + request.Status[1..].ToLower();

        if (entity.Status == newStatus)
            return ApiResponse<Unit>.Success(Unit.Value, $"Workflow Matrix is already {newStatus}.");

        entity.Status = newStatus;
        unitOfWork.WorkflowMatrixRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Workflow Matrix status updated to {newStatus} successfully.");
    }
}
