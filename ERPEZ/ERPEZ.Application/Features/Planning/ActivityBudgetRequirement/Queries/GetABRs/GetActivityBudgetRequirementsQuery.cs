using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ActivityBudgetRequirement.Queries.GetABRs;

public class GetActivityBudgetRequirementsQuery : IRequest<PaginatedApiResponse<Domain.Entities.Planning.ActivityBudgetRequirement>>
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Filters { get; set; }
    public string? Sorts { get; set; }
}