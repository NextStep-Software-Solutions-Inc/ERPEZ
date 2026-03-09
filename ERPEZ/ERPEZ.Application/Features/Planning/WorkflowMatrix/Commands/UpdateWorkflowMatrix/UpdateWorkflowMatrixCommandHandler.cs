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

            // Business Rule Validation: Recommending approver should typically be from the same office
            if (recommendingPosition.OfficeId != entity.OfficeId)
            {
                // Log warning but allow (could be intentional for cross-office workflows)
                // In production, you might want to log this for audit purposes
            }
            
            entity.RecommendingApproverPositionId = request.RecommendingApproverPositionId.Value;
        }

        if (request.FinalApproverPositionId.HasValue)
        {
            var finalPosition = await unitOfWork.PositionRepository.GetByIdAsync(request.FinalApproverPositionId.Value, cancellationToken);
            if (finalPosition == null)
                throw new NotFoundException("Final Approver Position not found.");

            // Business Rule: Final approver can be from different office (hierarchical approval is valid)
            // Example: Regional office documents approved by Head Office VP - no validation needed
            
            entity.FinalApproverPositionId = request.FinalApproverPositionId.Value;
        }

        unitOfWork.WorkflowMatrixRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}
