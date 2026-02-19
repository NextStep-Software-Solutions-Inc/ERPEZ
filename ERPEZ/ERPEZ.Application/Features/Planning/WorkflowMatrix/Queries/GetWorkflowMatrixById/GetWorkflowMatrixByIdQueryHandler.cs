using ERPEZ.Application.Features.Planning.WorkflowMatrix.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Planning.WorkflowMatrix.Queries.GetWorkflowMatrixById;

public class GetWorkflowMatrixByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetWorkflowMatrixByIdQuery, ApiResponse<WorkflowMatrixResponse>>
{
    public async Task<ApiResponse<WorkflowMatrixResponse>> Handle(GetWorkflowMatrixByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.WorkflowMatrixRepository.Query()
            .Include(x => x.FiscalYear)
            .Include(x => x.Organization)
            .FirstOrDefaultAsync(x => x.Id == request.Id && !x.IsDeleted, cancellationToken);

        if (entity == null)
            throw new NotFoundException("Workflow Matrix not found.");

        var response = new WorkflowMatrixResponse
        {
            Id = entity.Id,
            FiscalYearId = entity.FiscalYearId,
            FiscalYearYear = entity.FiscalYear?.Year ?? 0,
            OrganizationId = entity.OrganizationId,
            OrganizationName = entity.Organization?.Name ?? string.Empty,
            DocumentType = entity.DocumentType,
            CreatedAt = entity.CreatedAt,
            CreatedBy = entity.CreatedBy,
            UpdatedAt = entity.UpdatedAt,
            UpdatedBy = entity.UpdatedBy
        };

        return ApiResponse<WorkflowMatrixResponse>.Success(response);
    }
}
