using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.MasterDocumentType.Commands.UpdateMasterDocumentType;

public class UpdateMasterDocumentTypeCommandHandler(
    IUnitOfWork unitOfWork,
    IFileStorageService fileStorageService)
    : IRequestHandler<UpdateMasterDocumentTypeCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        UpdateMasterDocumentTypeCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.MasterDocumentTypeRepository
                         .GetByIdAsync(request.Id, cancellationToken)
                     ?? throw new NotFoundException("Document type not found.");

        if (await unitOfWork.MasterDocumentTypeRepository
                .IsNameDuplicateAsync(request.Name, request.Id, cancellationToken))
            throw new ConflictException($"A document type named '{request.Name}' already exists.");

        entity.Name         = request.Name;
        entity.Description  = request.Description;
        entity.EnvelopeType = request.EnvelopeType;
        entity.UpdatedAt    = DateTime.UtcNow;

        if (request.RemoveFile)
        {
            entity.TemplateFileUrl = null;
        }
        else if (request.FileId.HasValue)
        {
            var (promotedUrl, _) = await fileStorageService.PromoteFileAsync(request.FileId.Value, cancellationToken);
            entity.TemplateFileUrl = promotedUrl;
        }

        unitOfWork.MasterDocumentTypeRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Document type updated successfully.");
    }
}