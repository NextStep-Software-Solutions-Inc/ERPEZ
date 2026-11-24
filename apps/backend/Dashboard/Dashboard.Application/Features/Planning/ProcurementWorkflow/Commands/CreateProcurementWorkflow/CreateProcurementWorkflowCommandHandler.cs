using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementWorkflow.Commands.CreateProcurementWorkflow;

public class CreateProcurementWorkflowCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateProcurementWorkflowCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateProcurementWorkflowCommand request, CancellationToken cancellationToken)
    {
        // Check for duplicate Code
        var existingWorkflow = await unitOfWork.ProcurementWorkflowRepository.FindAsync(
            x => x.Code == request.Code,
            cancellationToken
        );

        if (existingWorkflow != null)
            throw new ConflictException($"Procurement Workflow with Code '{request.Code}' already exists.");

        var entity = new Domain.Entities.Planning.ProcurementWorkflow
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Code = request.Code,
            ApprovalLevel = request.ApprovalLevel,
            IsActive = true
        };

        await unitOfWork.ProcurementWorkflowRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id);
    }
}
