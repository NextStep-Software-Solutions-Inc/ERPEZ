using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WorkflowMatrix.Commands.UpdateWorkflowMatrix;

public class UpdateWorkflowMatrixCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateWorkflowMatrixCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateWorkflowMatrixCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.WorkflowMatrixRepository.GetByIdAsync(request.Id, cancellationToken);
        if (entity == null)
            throw new NotFoundException("Workflow Matrix not found.");

        if (request.DocumentType != null)
            entity.DocumentType = request.DocumentType;

        if (request.RecommendingApproverPositionId.HasValue)
        {
            var recommendingPosition = await unitOfWork.PositionRepository.GetByIdAsync(request.RecommendingApproverPositionId.Value, cancellationToken);
            if (recommendingPosition == null)
                throw new NotFoundException("Recommending Approver Position not found.");
            
            entity.RecommendingApproverPositionId = request.RecommendingApproverPositionId.Value;
        }

        if (request.FinalApproverPositionId.HasValue)
        {
            var finalPosition = await unitOfWork.PositionRepository.GetByIdAsync(request.FinalApproverPositionId.Value, cancellationToken);
            if (finalPosition == null)
                throw new NotFoundException("Final Approver Position not found.");
            
            entity.FinalApproverPositionId = request.FinalApproverPositionId.Value;
        }

        unitOfWork.WorkflowMatrixRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}
