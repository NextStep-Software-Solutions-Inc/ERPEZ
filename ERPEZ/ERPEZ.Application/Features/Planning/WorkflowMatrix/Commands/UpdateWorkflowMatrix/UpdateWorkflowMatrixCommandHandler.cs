using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WorkflowMatrix.Commands.UpdateWorkflowMatrix;

public class UpdateWorkflowMatrixCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateWorkflowMatrixCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(UpdateWorkflowMatrixCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.WorkflowMatrixRepository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
            throw new NotFoundException("Workflow Matrix not found.");

        entity.DocumentType = request.DocumentType;

        unitOfWork.WorkflowMatrixRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id);
    }
}
