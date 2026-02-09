using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Office.Commands.UpdateOfficeWorkflow;

public class UpdateOfficeWorkflowCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateOfficeWorkflowCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateOfficeWorkflowCommand request, CancellationToken cancellationToken)
    {
        var office = await unitOfWork.OfficeRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException($"Office with ID '{request.Id}' not found.");

        // Validate workflow exists if provided
        if (request.ProcurementWorkflowId.HasValue)
        {
            var workflow = await unitOfWork.ProcurementWorkflowRepository.GetByIdAsync(
                request.ProcurementWorkflowId.Value,
                cancellationToken: cancellationToken);

            if (workflow == null)
                throw new NotFoundException($"Procurement Workflow with ID '{request.ProcurementWorkflowId}' not found.");

            if (!workflow.IsActive)
                throw new ConflictException($"Procurement Workflow with ID '{request.ProcurementWorkflowId}' is inactive.");
        }

        office.ProcurementWorkflowId = request.ProcurementWorkflowId;

        unitOfWork.OfficeRepository.Update(office);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Office workflow updated successfully.");
    }
}
