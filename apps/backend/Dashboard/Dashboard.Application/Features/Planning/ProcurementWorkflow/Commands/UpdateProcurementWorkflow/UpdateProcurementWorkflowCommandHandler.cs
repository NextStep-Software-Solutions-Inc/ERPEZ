using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementWorkflow.Commands.UpdateProcurementWorkflow;

public class UpdateProcurementWorkflowCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateProcurementWorkflowCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateProcurementWorkflowCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.ProcurementWorkflowRepository.GetByIdAsync(request.Id, cancellationToken);

        if (entity == null)
            throw new NotFoundException($"Procurement Workflow with ID '{request.Id}' not found.");

        // Check for duplicate Code if Code is being updated
        if (request.UpdateProcurementWorkflow.Code != null && request.UpdateProcurementWorkflow.Code != entity.Code)
        {
            var existingWorkflow = await unitOfWork.ProcurementWorkflowRepository.FindAsync(
                x => x.Code == request.UpdateProcurementWorkflow.Code && x.Id != request.Id,
                cancellationToken
            );

            if (existingWorkflow != null)
                throw new ConflictException($"Procurement Workflow with Code '{request.UpdateProcurementWorkflow.Code}' already exists.");
        }

        // Update properties if provided
        if (request.UpdateProcurementWorkflow.Name != null)
            entity.Name = request.UpdateProcurementWorkflow.Name;

        if (request.UpdateProcurementWorkflow.Code != null)
            entity.Code = request.UpdateProcurementWorkflow.Code;

        if (request.UpdateProcurementWorkflow.ApprovalLevel.HasValue)
            entity.ApprovalLevel = request.UpdateProcurementWorkflow.ApprovalLevel.Value;

        if (request.UpdateProcurementWorkflow.IsActive.HasValue)
            entity.IsActive = request.UpdateProcurementWorkflow.IsActive.Value;

        unitOfWork.ProcurementWorkflowRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}

