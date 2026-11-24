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
                TechCount           = p.DocumentProfileItems.Count(i => !i.IsDeleted && i.MasterDocumentType.EnvelopeType == 1),
                FinCount            = p.DocumentProfileItems.Count(i => !i.IsDeleted && i.MasterDocumentType.EnvelopeType == 2),
                CreatedAt           = p.CreatedAt,
                Items               = p.DocumentProfileItems
                    .Where(i => !i.IsDeleted)
                    .OrderBy(i => i.OrderIndex)
                    .Select(i => new DocumentProfileItemDto
                    {
                        Id                   = i.Id,
                        MasterDocumentTypeId = i.MasterDocumentTypeId,
                        DocumentName         = i.MasterDocumentType.Name,
                        EnvelopeType         = i.MasterDocumentType.EnvelopeType,
                        OrderIndex           = i.OrderIndex,
                        TemplateFileUrl      = i.MasterDocumentType.TemplateFileUrl
                    }).ToList()
            };

        var (items, total) = await unitOfWork.DocumentProfileRepository
            .GetAllAsync(sieveModel, projection, cancellationToken);

        return new PaginatedApiResponse<DocumentProfileDto>(
            [.. items], query.PageNumber, query.PageSize, total);
    }
}