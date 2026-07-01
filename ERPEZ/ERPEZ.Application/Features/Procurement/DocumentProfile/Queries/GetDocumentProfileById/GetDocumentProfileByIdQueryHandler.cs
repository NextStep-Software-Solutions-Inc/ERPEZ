using ERPEZ.Application.Features.Procurement.DocumentProfile.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DocumentProfile.Queries.GetDocumentProfileById;

public class GetDocumentProfileByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetDocumentProfileByIdQuery, ApiResponse<DocumentProfileDto>>
{
    public async Task<ApiResponse<DocumentProfileDto>> Handle(
        GetDocumentProfileByIdQuery request, CancellationToken cancellationToken)
    {
        var profile = await unitOfWork.DocumentProfileRepository
                          .GetByIdWithItemsAsync(request.Id, cancellationToken)
                      ?? throw new NotFoundException("Document profile not found.");

        var dto = new DocumentProfileDto
        {
            Id                  = profile.Id,
            Name                = profile.Name,
            Description         = profile.Description,
            ProcurementCategory = profile.ProcurementCategory,
            ItemCount           = profile.DocumentProfileItems.Count(i => !i.IsDeleted),
            CreatedAt           = profile.CreatedAt,
            Items = profile.DocumentProfileItems
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

        return ApiResponse<DocumentProfileDto>.Success(dto);
    }
}