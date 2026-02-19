using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WorkflowMatrix.Commands.CreateWorkflowMatrix;

public record CreateWorkflowMatrixCommand : IRequest<ApiResponse<Guid>>
{
    public Guid FiscalYearId { get; init; }
    public Guid OrganizationId { get; init; }
    public string? DocumentType { get; init; }
}
