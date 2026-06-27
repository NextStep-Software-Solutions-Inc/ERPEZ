using System.Linq.Expressions;
using ERPEZ.Application.Features.Procurement.DocumentProfile.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Procurement.DocumentProfile.Queries.GetDocumentProfiles;

public class GetDocumentProfilesQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetDocumentProfilesQuery, PaginatedApiResponse<DocumentProfileDto>>
{
    public async Task<PaginatedApiResponse<DocumentProfileDto>> Handle(
        GetDocumentProfilesQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            Page     = query.PageNumber,
            PageSize = query.PageSize,
            Filters  = query.Filters,
            Sorts    = query.Sorts
        };

        Expression<Func<Domain.Entities.Procurement.DocumentProfile, DocumentProfileDto>>
            projection = p => new DocumentProfileDto
            {
                Id                  = p.Id,
                Name                = p.Name,
                Description         = p.Description,
                ProcurementCategory = p.ProcurementCategory,
                ItemCount           = p.DocumentProfileItems.Count(i => !i.IsDeleted),
                CreatedAt           = p.CreatedAt
                // Items list is omitted from the list response for performance;
                // use GetById for the full items breakdown
            };

        var (items, total) = await unitOfWork.DocumentProfileRepository
            .GetAllAsync(sieveModel, projection, cancellationToken);

        return new PaginatedApiResponse<DocumentProfileDto>(
            [.. items], query.PageNumber, query.PageSize, total);
    }
}