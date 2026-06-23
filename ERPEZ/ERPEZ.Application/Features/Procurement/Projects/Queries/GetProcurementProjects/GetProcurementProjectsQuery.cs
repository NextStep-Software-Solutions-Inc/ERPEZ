using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Procurement.Projects.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Procurement.Projects.Queries.GetProcurementProjects;

public record GetProcurementProjectsQuery : PaginatedQuery<PaginatedApiResponse<ProcurementProjectResponse>>
{
    public Guid? ModeOfProcurementId { get; init; }
    public string? ModeOfProcurement { get; init; }
}
