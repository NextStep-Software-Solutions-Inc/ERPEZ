using System.Linq.Expressions;
using ERPEZ.Application.Features.Procurement.MasterDocumentType.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Procurement.MasterDocumentType.Queries.GetMasterDocumentTypes;

public class GetMasterDocumentTypesQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetMasterDocumentTypesQuery, PaginatedApiResponse<MasterDocumentTypeDto>>
{
    public async Task<PaginatedApiResponse<MasterDocumentTypeDto>> Handle(
        GetMasterDocumentTypesQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            Page     = query.PageNumber,
            PageSize = query.PageSize,
            Filters  = query.Filters,
            Sorts    = query.Sorts
        };

        Expression<Func<Domain.Entities.Procurement.MasterDocumentType, MasterDocumentTypeDto>>
            projection = d => new MasterDocumentTypeDto
            {
                Id              = d.Id,
                Name            = d.Name,
                Description     = d.Description,
                EnvelopeType    = d.EnvelopeType,
                TemplateFileUrl = d.TemplateFileUrl,
                CreatedAt       = d.CreatedAt
            };

        var (items, total) = await unitOfWork.MasterDocumentTypeRepository
            .GetAllAsync(sieveModel, projection, cancellationToken);

        return new PaginatedApiResponse<MasterDocumentTypeDto>(
            [.. items], query.PageNumber, query.PageSize, total);
    }
}