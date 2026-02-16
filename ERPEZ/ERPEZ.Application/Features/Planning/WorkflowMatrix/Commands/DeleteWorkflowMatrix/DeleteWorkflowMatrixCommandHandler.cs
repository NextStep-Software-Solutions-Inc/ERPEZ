using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WorkflowMatrix.Commands.DeleteWorkflowMatrix;

public class DeleteWorkflowMatrixCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteWorkflowMatrixCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteWorkflowMatrixCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.WorkflowMatrixRepository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
            throw new NotFoundException("Workflow Matrix not found.");

        unitOfWork.WorkflowMatrixRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}
