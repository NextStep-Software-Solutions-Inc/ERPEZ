using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRItemMOV.Commands.UpdateOPCRItemMOV;

public class UpdateOPCRItemMOVCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateOPCRItemMOVCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(
        UpdateOPCRItemMOVCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.OPCRItemMOVRepository.GetByIdAsync(
            request.Id, cancellationToken)
            ?? throw new NotFoundException("OPCR Item MOV not found.");

        var dto = request.UpdateOPCRItemMOV;

        // Check for duplicate RequirementName if changed
        if (entity.RequirementName != dto.RequirementName)
        {
            var duplicate = await unitOfWork.OPCRItemMOVRepository.FindAsync(
                m => m.OPCRItemId == entity.OPCRItemId
                  && m.RequirementName == dto.RequirementName
                  && m.Id != entity.Id,
                cancellationToken);

            if (duplicate != null)
                throw new ConflictException(
                    $"A MOV with requirement name '{dto.RequirementName}' already exists for this OPCR Item.");
        }

        entity.RequirementName = dto.RequirementName;
        entity.AttachedUrl     = dto.AttachedUrl;
        entity.UploadedDate    = dto.AttachedUrl != null ? dto.UploadedDate ?? DateTime.UtcNow : null;

        unitOfWork.OPCRItemMOVRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "OPCR Item MOV updated successfully.");
    }
}