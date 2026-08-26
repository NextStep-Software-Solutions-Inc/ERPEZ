using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.AddConsolidatedPR;

public class AddConsolidatedPRCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<AddConsolidatedPRCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(AddConsolidatedPRCommand request, CancellationToken cancellationToken)
    {
        var project = await unitOfWork.ProcurementProjectRepository.GetByIdAsync(request.ProjectId, cancellationToken);
        if (project == null)
        {
            return ApiResponse<Unit>.Fail("Procurement project not found.");
        }

        var consolidatedPR = await unitOfWork.ConsolidatedPRRepository.GetByIdAsync(request.Request.ConsolidatedPRId, cancellationToken);
        if (consolidatedPR == null)
        {
            return ApiResponse<Unit>.Fail("Consolidated PR not found.");
        }

        if (consolidatedPR.Status != StatusEnum.Approved)
        {
            return ApiResponse<Unit>.Fail("Only approved Consolidated PRs can be added to a procurement project.");
        }

        var existingProjectWithCPR = await unitOfWork.ProcurementProjectRepository.FindAsync(
            p => p.ConsolidatedPRId == request.Request.ConsolidatedPRId && p.Id != request.ProjectId,
            cancellationToken);

        if (existingProjectWithCPR != null)
        {
            return ApiResponse<Unit>.Fail("This Consolidated PR is already associated with another procurement project.");
        }

        project.ConsolidatedPRId = request.Request.ConsolidatedPRId;

        unitOfWork.ProcurementProjectRepository.Update(project);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Consolidated PR added to procurement project successfully.");
    }
}
