// CreateOPCRItemMOVCommandHandler.cs
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRItemMOV.Commands.CreateOPCRItemMOV;

public class CreateOPCRItemMOVCommandHandler(
    IUnitOfWork unitOfWork,
    IFileStorageService fileStorageService)
    : IRequestHandler<CreateOPCRItemMOVCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        CreateOPCRItemMOVCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.OPCRItemRepository.GetByIdAsync(request.OPCRItemId, cancellationToken)
            ?? throw new NotFoundException("OPCR Item not found.");

        var duplicate = await unitOfWork.OPCRItemMOVRepository.FindAsync(
            m => m.OPCRItemId      == request.OPCRItemId
              && m.RequirementName == request.RequirementName,
            cancellationToken);

        if (duplicate != null)
            throw new ConflictException(
                $"A MOV with requirement name '{request.RequirementName}' already exists for this OPCR Item.");

        // Promote temp file to permanent storage → returns permanent URL
        var permanentUrl = await fileStorageService.PromoteFileAsync(request.FileId);

        var entity = new Domain.Entities.Planning.OPCRItemMOV
        {
            Id              = Guid.NewGuid(),
            OPCRItemId      = request.OPCRItemId,
            RequirementName = request.RequirementName,
            FileId          = request.FileId,
            AttachedUrl     = permanentUrl,
            UploadedDate    = DateTime.UtcNow,
            CreatedAt       = DateTime.UtcNow
        };

        await unitOfWork.OPCRItemMOVRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "OPCR Item MOV created successfully.");
    }
}