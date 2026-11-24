using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.MasterDocumentType.Commands.CreateMasterDocumentType;

public class CreateMasterDocumentTypeCommandHandler(
    IUnitOfWork unitOfWork,
    IFileStorageService fileStorageService)
    : IRequestHandler<CreateMasterDocumentTypeCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        CreateMasterDocumentTypeCommand request, CancellationToken cancellationToken)
    {
        if (await unitOfWork.MasterDocumentTypeRepository
                .IsNameDuplicateAsync(request.Name, cancellationToken: cancellationToken))
            throw new ConflictException($"A document type named '{request.Name}' already exists.");

        string? url = null;
        if (request.FileId.HasValue)
        {
            var (promotedUrl, _) = await fileStorageService.PromoteFileAsync(request.FileId.Value, cancellationToken);
            url = promotedUrl;
        }

        var entity = new Domain.Entities.Procurement.MasterDocumentType
        {
            Id              = Guid.NewGuid(),
            Name            = request.Name,
            Description     = request.Description,
            EnvelopeType    = request.EnvelopeType,
            TemplateFileUrl = url,
            CreatedAt       = DateTime.UtcNow
        };

        await unitOfWork.MasterDocumentTypeRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "Document type created successfully.");
    }
}