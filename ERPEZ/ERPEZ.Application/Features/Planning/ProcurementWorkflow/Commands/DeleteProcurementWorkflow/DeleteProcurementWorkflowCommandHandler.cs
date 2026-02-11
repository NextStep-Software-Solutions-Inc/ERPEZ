using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementWorkflow.Commands.DeleteProcurementWorkflow;

public class DeleteProcurementWorkflowCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteProcurementWorkflowCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteProcurementWorkflowCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.ProcurementWorkflowRepository.GetByIdAsync(request.Id, cancellationToken);

        if (entity == null)
            throw new NotFoundException($"Procurement Workflow with ID '{request.Id}' not found.");

        unitOfWork.ProcurementWorkflowRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}
