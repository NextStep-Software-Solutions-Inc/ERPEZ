// UpdateOPCRItemMOVCommandHandler.cs
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRItemMOV.Commands.UpdateOPCRItemMOV;

public class UpdateOPCRItemMOVCommandHandler(
    IUnitOfWork unitOfWork,
    IFileStorageService fileStorageService)
    : IRequestHandler<UpdateOPCRItemMOVCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        UpdateOPCRItemMOVCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.OPCRItemMOVRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("OPCR Item MOV not found.");

        var dto = request.Request;

        if (dto.FYActiveKPIMeasurementId.HasValue)
        {
            _ = await unitOfWork.FYActiveKPIMeasurementRepository
                .GetByIdAsync(dto.FYActiveKPIMeasurementId.Value, cancellationToken)
                ?? throw new NotFoundException("FY Active KPI Measurement not found.");

            entity.FYActiveKPIMeasurementId = dto.FYActiveKPIMeasurementId.Value;
        }

        if (dto.RequirementName != null)
            entity.RequirementName = dto.RequirementName;

        var duplicate = await unitOfWork.OPCRItemMOVRepository.FindAsync(
            m => m.Id != entity.Id
              && m.OPCRItemId == entity.OPCRItemId
              && m.FYActiveKPIMeasurementId == entity.FYActiveKPIMeasurementId
              && m.RequirementName == entity.RequirementName,
            cancellationToken);

        if (duplicate != null)
            throw new ConflictException(
                $"A MOV with requirement name '{entity.RequirementName}' already exists for this measurement.");

        // If a new file is provided — promote it and replace the existing attachment
        if (dto.FileId.HasValue)
        {
            // Delete old permanent file if one exists
            if (entity.FileId.HasValue)
                await fileStorageService.DeletePermanentAsync(entity.FileId.Value);

            var permanentUrl   = await fileStorageService.PromoteFileAsync(dto.FileId.Value);
            entity.FileId      = dto.FileId.Value;
            entity.AttachedUrl = permanentUrl;
            entity.UploadedDate = DateTime.UtcNow;
        }

        unitOfWork.OPCRItemMOVRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "OPCR Item MOV updated successfully.");
    }
}