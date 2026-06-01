using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OPCRItemMOV.Commands.CreateOPCRItemMOV;

public class CreateOPCRItemMOVCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateOPCRItemMOVCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(
        CreateOPCRItemMOVCommand request, CancellationToken cancellationToken)
    {
        // Validate OPCRItem exists
        _ = await unitOfWork.OPCRItemRepository.GetByIdAsync(request.OPCRItemId, cancellationToken)
            ?? throw new NotFoundException("OPCR Item not found.");

        // Check for duplicate RequirementName per OPCRItem
        var duplicate = await unitOfWork.OPCRItemMOVRepository.FindAsync(
            m => m.OPCRItemId == request.OPCRItemId
              && m.RequirementName == request.RequirementName,
            cancellationToken);

        if (duplicate != null)
            throw new ConflictException(
                $"A MOV with requirement name '{request.RequirementName}' already exists for this OPCR Item.");

        var entity = new Domain.Entities.Planning.OPCRItemMOV
        {
            Id              = Guid.NewGuid(),
            OPCRItemId      = request.OPCRItemId,
            RequirementName = request.RequirementName,
            AttachedUrl     = request.AttachedUrl,
            UploadedDate    = request.AttachedUrl != null ? request.UploadedDate ?? DateTime.UtcNow : null
        };

        await unitOfWork.OPCRItemMOVRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "OPCR Item MOV created successfully.");
    }
}