using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementActivityType.Commands.UpdateProcurementActivityType;

public class UpdateProcurementActivityTypeCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateProcurementActivityTypeCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateProcurementActivityTypeCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.ProcurementActivityTypeRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Procurement activity type not found.");

        // Check for duplicate names if name is being updated
        if (!string.IsNullOrEmpty(request.Name) && request.Name != entity.Name)
        {
            var existing = await unitOfWork.ProcurementActivityTypeRepository.FindAsync(
                x => x.Name == request.Name && x.Id != request.Id && !x.IsDeleted,
                cancellationToken
            );

            if (existing != null)
                throw new ConflictException($"Procurement activity type with name '{request.Name}' already exists.");

            entity.Name = request.Name;
        }

        // Check for duplicate activity code if activity code is being updated
        if (!string.IsNullOrEmpty(request.ActivityCode) && request.ActivityCode != entity.ActivityCode)
        {
            var existingCode = await unitOfWork.ProcurementActivityTypeRepository.FindAsync(
                x => x.ActivityCode == request.ActivityCode && x.Id != request.Id && !x.IsDeleted,
                cancellationToken
            );

            if (existingCode != null)
                throw new ConflictException($"Procurement activity type with code '{request.ActivityCode}' already exists.");

            entity.ActivityCode = request.ActivityCode;
        }

        if (!string.IsNullOrEmpty(request.Description))
            entity.Description = request.Description;

        if (request.MinDays.HasValue)
            entity.MinDays = request.MinDays.Value;

        if (request.MaxDays.HasValue)
            entity.MaxDays = request.MaxDays.Value;

        if (request.IsActive.HasValue)
            entity.IsActive = request.IsActive.Value;

        entity.UpdatedAt = DateTime.UtcNow;

        unitOfWork.ProcurementActivityTypeRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Procurement activity type updated successfully.");
    }
}

