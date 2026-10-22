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

        // Resolve recommending approver user
        var recommendingPersonnel = await unitOfWork.PersonnelPositionRepository.FindAsync(
            pp => pp.PositionId == entity.RecommendingApproverPositionId && pp.IsActive == true,
            cancellationToken);

        Domain.Entities.Planning.User? recommendingUser = null;
        if (recommendingPersonnel != null)
            recommendingUser = await unitOfWork.UserRepository.GetByIdAsync(recommendingPersonnel.UserId, cancellationToken);

        // Resolve final approver user
        var finalPersonnel = await unitOfWork.PersonnelPositionRepository.FindAsync(
            pp => pp.PositionId == entity.FinalApproverPositionId && pp.IsActive == true,
            cancellationToken);

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
            Status = entity.Status,
            
            // Nested recommending approver
            RecommendingApprover = new ApproverInfo
            {
                Position = new PositionInfo
                {
                    Id = entity.RecommendingApproverPositionId,
                    Title = entity.RecommendingApproverPosition?.Title ?? string.Empty,
                    Code = entity.RecommendingApproverPosition?.Code ?? string.Empty
                },
                CurrentUser = recommendingUser != null ? new UserInfo
                {
                    Id = recommendingUser.Id,
                    Name = $"{recommendingUser.FirstName} {recommendingUser.LastName}",
                    Email = recommendingUser.Email ?? string.Empty
                } : null
            },
            
            // Nested final approver
            FinalApprover = new ApproverInfo
            {
                Position = new PositionInfo
                {
                    Id = entity.FinalApproverPositionId,
                    Title = entity.FinalApproverPosition?.Title ?? string.Empty,
                    Code = entity.FinalApproverPosition?.Code ?? string.Empty
                },
                CurrentUser = finalUser != null ? new UserInfo
                {
                    Id = finalUser.Id,
                    Name = $"{finalUser.FirstName} {finalUser.LastName}",
                    Email = finalUser.Email ?? string.Empty
                } : null
            },
            CreatedAt = entity.CreatedAt,
            CreatedBy = entity.CreatedBy,
            UpdatedAt = entity.UpdatedAt,
            UpdatedBy = entity.UpdatedBy
        };

        return ApiResponse<WorkflowMatrixResponse>.Success(response);
    }
}
