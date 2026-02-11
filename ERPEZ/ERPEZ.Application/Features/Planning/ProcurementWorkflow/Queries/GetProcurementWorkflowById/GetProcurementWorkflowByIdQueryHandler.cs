using ERPEZ.Application.Features.Planning.ProcurementWorkflow.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementWorkflow.Queries.GetProcurementWorkflowById;

public class GetProcurementWorkflowByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetProcurementWorkflowByIdQuery, ApiResponse<ProcurementWorkflowResponse>>
{
    public async Task<ApiResponse<ProcurementWorkflowResponse>> Handle(
        GetProcurementWorkflowByIdQuery request,
        CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.ProcurementWorkflowRepository.GetByIdAsync(request.Id, cancellationToken);

        if (entity == null)
            throw new NotFoundException($"Procurement Workflow with ID '{request.Id}' not found.");

        var response = new ProcurementWorkflowResponse
        {
            Id = entity.Id,
            Name = entity.Name,
            Code = entity.Code,
            ApprovalLevel = entity.ApprovalLevel,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt
        };

        return ApiResponse<ProcurementWorkflowResponse>.Success(response);
    }
}
