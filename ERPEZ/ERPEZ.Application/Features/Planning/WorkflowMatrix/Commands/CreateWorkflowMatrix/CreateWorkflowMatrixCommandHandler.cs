using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WorkflowMatrix.Commands.CreateWorkflowMatrix;

public class CreateWorkflowMatrixCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateWorkflowMatrixCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateWorkflowMatrixCommand request, CancellationToken cancellationToken)
    {
        var fiscalYear = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId, cancellationToken);
        if (fiscalYear == null)
            throw new NotFoundException("Fiscal Year not found.");

        var office = await unitOfWork.OfficeRepository.GetByIdAsync(request.OfficeId, cancellationToken);
        if (office == null)
            throw new NotFoundException("Office not found.");

        // Validate Positions exist
        var recommendingPosition = await unitOfWork.PositionRepository.GetByIdAsync(request.RecommendingApproverPositionId, cancellationToken);
        if (recommendingPosition == null)
            throw new NotFoundException("Recommending Approver Position not found.");

        var finalPosition = await unitOfWork.PositionRepository.GetByIdAsync(request.FinalApproverPositionId, cancellationToken);
        if (finalPosition == null)
            throw new NotFoundException("Final Approver Position not found.");

        // Business Rule Validation: Check if positions belong to appropriate offices
        // Recommending approver should typically be from the same office (strong recommendation)
        if (recommendingPosition.OfficeId != request.OfficeId)
        {
            // Log warning but allow (could be intentional for cross-office workflows)
            // In production, you might want to log this for audit purposes
            // Example: _logger.LogWarning("Recommending approver position {PositionId} is from office {PositionOfficeId} but workflow is for office {WorkflowOfficeId}", 
            //     recommendingPosition.Id, recommendingPosition.OfficeId, request.OfficeId);
        }

        // Final approver can be from different office (hierarchical approval is valid)
        // Example: Regional office WFPs approved by Head Office VP
        // No validation needed for final approver office mismatch

        var existingMatrix = await unitOfWork.WorkflowMatrixRepository.FindAsync(
            x => x.FiscalYearId == request.FiscalYearId && 
                 x.OfficeId == request.OfficeId && 
                 x.DocumentType == request.DocumentType,
            cancellationToken);

        if (existingMatrix != null)
            throw new ConflictException("Workflow Matrix already exists for this Fiscal Year, Office, and Document Type combination.");

        var entity = new Domain.Entities.Planning.WorkflowMatrix
        {
            Id = Guid.NewGuid(),
            OfficeId = request.OfficeId,
            FiscalYearId = request.FiscalYearId,
            RecommendingApproverPositionId = request.RecommendingApproverPositionId,
            FinalApproverPositionId = request.FinalApproverPositionId,
            DocumentType = request.DocumentType,
            Status = "Active"
        };

        await unitOfWork.WorkflowMatrixRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id);
    }
}
