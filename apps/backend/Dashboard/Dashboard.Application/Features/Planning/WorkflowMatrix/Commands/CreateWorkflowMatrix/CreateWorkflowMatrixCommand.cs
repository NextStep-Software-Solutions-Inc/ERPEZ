using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WorkflowMatrix.Commands.CreateWorkflowMatrix;

public record CreateWorkflowMatrixCommand : IRequest<ApiResponse<Guid>>
{
    public Guid OfficeId { get; init; }
    public Guid FiscalYearId { get; init; }
    public Guid RecommendingApproverPositionId { get; init; }
    public Guid FinalApproverPositionId { get; init; }
    public string? DocumentType { get; init; }
}
