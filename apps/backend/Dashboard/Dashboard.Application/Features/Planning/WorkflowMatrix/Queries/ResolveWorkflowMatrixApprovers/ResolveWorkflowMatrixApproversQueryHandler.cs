using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WorkflowMatrix.Queries.ResolveWorkflowMatrixApprovers;

public class ResolveWorkflowMatrixApproversQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<ResolveWorkflowMatrixApproversQuery, ApiResponse<ResolveWorkflowMatrixApproversResponse>>
{
    public async Task<ApiResponse<ResolveWorkflowMatrixApproversResponse>> Handle(ResolveWorkflowMatrixApproversQuery request, CancellationToken cancellationToken)
    {
        var office = await unitOfWork.OfficeRepository.GetByIdAsync(request.OfficeId, cancellationToken);
        if (office == null)
            throw new NotFoundException("Office not found.");

        var recommending = await ResolveApproverAsync(
            request.OfficeId,
            request.RecommendingApproverUserId,
            "Recommending approver",
            cancellationToken);

        var final = await ResolveApproverAsync(
            request.OfficeId,
            request.FinalApproverUserId,
            "Final approver",
            cancellationToken);

        var response = new ResolveWorkflowMatrixApproversResponse
        {
            OfficeId = request.OfficeId,
            RecommendingApprover = recommending,
            FinalApprover = final
        };

        return ApiResponse<ResolveWorkflowMatrixApproversResponse>.Success(response);
    }

    private async Task<ResolvedApprover> ResolveApproverAsync(Guid officeId, Guid userId, string approverType, CancellationToken cancellationToken)
    {
        var user = await unitOfWork.UserRepository.GetByIdAsync(userId, cancellationToken);
        if (user == null)
            throw new NotFoundException($"{approverType} user not found.");

        var activeAssignments = await unitOfWork.PersonnelPositionRepository.GetByUserIdAsync(userId, cancellationToken);
        var officeAssignments = activeAssignments
            .Where(pp => pp.Position?.OfficeId == officeId)
            .ToList();

        if (officeAssignments.Count == 0)
            throw new ConflictException($"{approverType} user has no active position in the selected office.");

        if (officeAssignments.Count > 1)
            throw new ConflictException($"{approverType} user has multiple active positions in the selected office. Please select by position directly.");

        var assignment = officeAssignments[0];
        var position = assignment.Position!;

        return new ResolvedApprover
        {
            UserId = user.Id,
            UserName = user.FullName,
            PositionId = position.Id,
            PositionTitle = position.Title,
            PositionCode = position.Code
        };
    }
}
