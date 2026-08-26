using ERPEZ.Application.Features.Procurement.SupplierPortal.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.SupplierPortal.Queries.GetPublicProjects;

public record GetPublicProjectsQuery : IRequest<PaginatedApiResponse<PublicProjectListItemDto>>
{
    public int     PageNumber { get; init; } = 1;
    public int     PageSize   { get; init; } = 10;
    public string? Filters    { get; init; }
    public string? Sorts      { get; init; }
}