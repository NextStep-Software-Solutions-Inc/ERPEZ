using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementMode.Commands.CreateProcurementMode;

public class CreateProcurementModeCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateProcurementModeCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateProcurementModeCommand request, CancellationToken cancellationToken)
    {
        // Validate category exists if provided
        if (request.ProcurementCategoryId != Guid.Empty)
        {
            _ = await unitOfWork.ProcurementCategoryRepository.GetByIdAsync(request.ProcurementCategoryId, cancellationToken)
                ?? throw new NotFoundException("Procurement category not found.");
        }

        // Check for duplicates
        var existing = await unitOfWork.ProcurementModeRepository.FindAsync(
            x => x.Name == request.Name && !x.IsDeleted,
            cancellationToken
        );

        if (existing != null)
            throw new ConflictException($"Procurement mode with name '{request.Name}' already exists.");

        var entity = new Domain.Entities.Planning.ProcurementMode
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            ProcurementCategoryId = request.ProcurementCategoryId,
            IsActive = true,
            IsArchived = false
        };

        await unitOfWork.ProcurementModeRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "Procurement mode created successfully.");
    }
}
