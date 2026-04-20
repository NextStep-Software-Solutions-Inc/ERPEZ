using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementMode.Commands.UpdateProcurementMode;

public class UpdateProcurementModeCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateProcurementModeCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateProcurementModeCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.ProcurementModeRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Procurement mode not found.");

        if (!string.IsNullOrEmpty(request.Name))
        {
            // Check for duplicates
            var existing = await unitOfWork.ProcurementModeRepository.FindAsync(
                x => x.Name == request.Name && x.Id != request.Id && !x.IsDeleted,
                cancellationToken
            );

            if (existing != null)
                throw new ConflictException($"Procurement mode with name '{request.Name}' already exists.");

            entity.Name = request.Name;
        }

        if (request.Description != null)
            entity.Description = request.Description;

        if (request.MinThreshold.HasValue)
            entity.MinThreshold = request.MinThreshold.Value;

        if (request.MaxThreshold.HasValue)
            entity.MaxThreshold = request.MaxThreshold.Value;

        if (request.ProcurementCategoryId.HasValue)
        {
            // Validate category exists
            _ = await unitOfWork.ProcurementCategoryRepository.GetByIdAsync(request.ProcurementCategoryId.Value, cancellationToken)
                ?? throw new NotFoundException("Procurement category not found.");

            entity.ProcurementCategoryId = request.ProcurementCategoryId.Value;
        }

        if (request.IsActive.HasValue)
            entity.IsActive = request.IsActive.Value;

        if (entity.MaxThreshold.HasValue && entity.MaxThreshold.Value < entity.MinThreshold)
            throw new ValidationException("Max threshold must be greater than or equal to min threshold.");

        unitOfWork.ProcurementModeRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Procurement mode updated successfully.");
    }
}
