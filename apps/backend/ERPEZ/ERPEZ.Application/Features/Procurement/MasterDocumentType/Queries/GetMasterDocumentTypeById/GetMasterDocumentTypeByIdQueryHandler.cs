using ERPEZ.Application.Features.Procurement.MasterDocumentType.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.MasterDocumentType.Queries.GetMasterDocumentTypeById;

public class GetMasterDocumentTypeByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetMasterDocumentTypeByIdQuery, ApiResponse<MasterDocumentTypeDto>>
{
    public async Task<ApiResponse<MasterDocumentTypeDto>> Handle(
        GetMasterDocumentTypeByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.MasterDocumentTypeRepository
                         .GetByIdAsync(request.Id, cancellationToken)
                     ?? throw new NotFoundException("Document type not found.");

        return ApiResponse<MasterDocumentTypeDto>.Success(new MasterDocumentTypeDto
        {
            Id              = entity.Id,
            Name            = entity.Name,
            Description     = entity.Description,
            EnvelopeType    = entity.EnvelopeType,
            TemplateFileUrl = entity.TemplateFileUrl,
            CreatedAt       = entity.CreatedAt
        });
    }
}