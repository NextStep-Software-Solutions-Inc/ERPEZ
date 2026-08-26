using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Projects.Commands.DeleteProcurementProject;

public class DeleteProcurementProjectCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteProcurementProjectCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteProcurementProjectCommand request, CancellationToken cancellationToken)
    {
        var project = await unitOfWork.ProcurementProjectRepository.GetByIdAsync(request.Id, cancellationToken);
        if (project == null)
        {
            return ApiResponse<Unit>.Fail("Procurement project not found.");
        }

        // Reverting Consolidated PR status placeholder (if repository/table existed)
        // e.g., await unitOfWork.ConsolidatedPRRepository.RevertStatusAsync(project.ConsolidatedPRId, cancellationToken);

        unitOfWork.ProcurementProjectRepository.Remove(project);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Procurement project deleted and Consolidated PR status reverted.");
    }
}
