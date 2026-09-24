using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Procurement.Projects.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Procurement.Projects.Queries.GetProcurementProjects;

public record GetProcurementProjectsQuery : PaginatedQuery<PaginatedApiResponse<ProcurementProjectResponse>>
{
    public new int PageSize { get; init; } = 100;
    public bool? HasRFQ { get; init; }
    public bool? HasApprovedRFQ { get; init; }
    public bool? ForSupplierPortal { get; init; }
}
