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

        // Note: ConsolidatedPR entity is under development.
        // For now, we update the ConsolidatedPRId on the project.
        project.ConsolidatedPRId = request.Request.ConsolidatedPRId;

        unitOfWork.ProcurementProjectRepository.Update(project);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Consolidated PR added to procurement project successfully.");
    }
}
