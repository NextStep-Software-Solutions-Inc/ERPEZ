using ERPEZ.Application.Features.Planning.WorkflowMatrix.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WorkflowMatrix.Queries.GetWorkflowMatrixById;

public class GetWorkflowMatrixByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetWorkflowMatrixByIdQuery, ApiResponse<WorkflowMatrixResponse>>
{
    public async Task<ApiResponse<WorkflowMatrixResponse>> Handle(GetWorkflowMatrixByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.WorkflowMatrixRepository.GetByIdWithNavigationAsync(request.Id, cancellationToken);

        if (entity == null)
            throw new NotFoundException("Workflow Matrix not found.");

        // Resolve actual users from positions (who currently holds these positions)
        var recommendingPersonnel = await unitOfWork.PersonnelPositionRepository.FindAsync(
            pp => pp.PositionId == entity.RecommendingApproverPositionId && pp.IsActive == true,
            cancellationToken);

        var finalPersonnel = await unitOfWork.PersonnelPositionRepository.FindAsync(
            pp => pp.PositionId == entity.FinalApproverPositionId && pp.IsActive == true,
            cancellationToken);

        // Get user details if personnel assignments exist
        Domain.Entities.Planning.User? recommendingUser = null;
        if (recommendingPersonnel != null)
            recommendingUser = await unitOfWork.UserRepository.GetByIdAsync(recommendingPersonnel.UserId, cancellationToken);

        Domain.Entities.Planning.User? finalUser = null;
        if (finalPersonnel != null)
            finalUser = await unitOfWork.UserRepository.GetByIdAsync(finalPersonnel.UserId, cancellationToken);

        var response = new WorkflowMatrixResponse
        {
            Id = entity.Id,
            FiscalYearId = entity.FiscalYearId,
            FiscalYear = entity.FiscalYear?.Year ?? 0,
            OfficeId = entity.OfficeId,
            OfficeName = entity.Office?.Name ?? string.Empty,
            DocumentType = entity.DocumentType,
            
            // Position information
            RecommendingApproverPositionId = entity.RecommendingApproverPositionId,
            RecommendingApproverPositionTitle = entity.RecommendingApproverPosition?.Title ?? string.Empty,
            
            FinalApproverPositionId = entity.FinalApproverPositionId,
            FinalApproverPositionTitle = entity.FinalApproverPosition?.Title ?? string.Empty,
            
            // Resolved user information (can be null if position is vacant)
            RecommendingApproverId = recommendingUser?.Id,
            RecommendingApproverName = recommendingUser != null 
                ? $"{recommendingUser.FirstName} {recommendingUser.LastName}" 
                : null,
            
            FinalApproverId = finalUser?.Id,
            FinalApproverName = finalUser != null 
                ? $"{finalUser.FirstName} {finalUser.LastName}" 
                : null,
            
            CreatedAt = entity.CreatedAt,
            CreatedBy = entity.CreatedBy,
            UpdatedAt = entity.UpdatedAt,
            UpdatedBy = entity.UpdatedBy
        };

        return ApiResponse<WorkflowMatrixResponse>.Success(response);
    }
}
