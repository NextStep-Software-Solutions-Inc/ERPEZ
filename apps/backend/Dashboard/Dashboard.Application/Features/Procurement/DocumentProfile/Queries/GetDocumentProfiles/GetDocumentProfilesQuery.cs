using ERPEZ.Application.Features.Procurement.DocumentProfile.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DocumentProfile.Queries.GetDocumentProfiles;

public record GetDocumentProfilesQuery : IRequest<PaginatedApiResponse<DocumentProfileDto>>
{
    public int     PageNumber { get; init; } = 1;
    public int     PageSize   { get; init; } = 25;
    public string? Filters    { get; init; }
    public string? Sorts      { get; init; }
}