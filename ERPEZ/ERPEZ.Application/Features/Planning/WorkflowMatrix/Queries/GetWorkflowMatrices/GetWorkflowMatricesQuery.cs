using ERPEZ.Application.Features.Planning.WorkflowMatrix.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.WorkflowMatrix.Queries.GetWorkflowMatrices;

public record GetWorkflowMatricesQuery : IRequest<PaginatedApiResponse<WorkflowMatrixResponse>>
{
    public string? Filters { get; init; }
    public string? Sorts { get; init; }
    public int? Page { get; init; }
    public int? PageSize { get; init; }
}
