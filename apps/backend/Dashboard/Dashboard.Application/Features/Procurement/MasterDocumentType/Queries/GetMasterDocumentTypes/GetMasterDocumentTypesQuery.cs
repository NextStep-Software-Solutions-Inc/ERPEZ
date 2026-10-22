using ERPEZ.Application.Features.Procurement.MasterDocumentType.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.MasterDocumentType.Queries.GetMasterDocumentTypes;

public record GetMasterDocumentTypesQuery : IRequest<PaginatedApiResponse<MasterDocumentTypeDto>>
{
    public int     PageNumber { get; init; } = 1;
    public int     PageSize   { get; init; } = 25;
    public string? Filters    { get; init; }
    public string? Sorts      { get; init; }
}