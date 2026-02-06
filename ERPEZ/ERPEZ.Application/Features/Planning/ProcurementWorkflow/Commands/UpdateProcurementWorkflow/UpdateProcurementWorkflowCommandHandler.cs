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
        if (request.Request.Code != null && request.Request.Code != entity.Code)
        {
            var existingWorkflow = await unitOfWork.ProcurementWorkflowRepository.FindAsync(
                x => x.Code == request.Request.Code && x.Id != request.Id,
                cancellationToken
            );

            if (existingWorkflow != null)
                throw new ConflictException($"Procurement Workflow with Code '{request.Request.Code}' already exists.");
        }

        // Update properties if provided
        if (request.Request.Name != null)
            entity.Name = request.Request.Name;

        if (request.Request.Code != null)
            entity.Code = request.Request.Code;

        if (request.Request.ApprovalLevel.HasValue)
            entity.ApprovalLevel = request.Request.ApprovalLevel.Value;

        if (request.Request.IsActive.HasValue)
            entity.IsActive = request.Request.IsActive.Value;

        unitOfWork.ProcurementWorkflowRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value);
    }
}
