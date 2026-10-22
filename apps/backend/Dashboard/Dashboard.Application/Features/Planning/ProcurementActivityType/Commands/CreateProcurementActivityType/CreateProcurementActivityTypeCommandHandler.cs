using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementActivityType.Commands.CreateProcurementActivityType;

public class CreateProcurementActivityTypeCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateProcurementActivityTypeCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateProcurementActivityTypeCommand request, CancellationToken cancellationToken)
    {
        // Check for duplicates
        var existing = await unitOfWork.ProcurementActivityTypeRepository.FindAsync(
            x => x.Name == request.Name && !x.IsDeleted,
            cancellationToken
        );

        if (existing != null)
            throw new ConflictException($"Procurement activity type with name '{request.Name}' already exists.");

        var existingCode = await unitOfWork.ProcurementActivityTypeRepository.FindAsync(
            x => x.ActivityCode == request.ActivityCode && !x.IsDeleted,
            cancellationToken
        );

        if (existingCode != null)
            throw new ConflictException($"Procurement activity type with code '{request.ActivityCode}' already exists.");

        var entity = new Domain.Entities.Planning.ProcurementActivityType
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            ActivityCode = request.ActivityCode,
            Description = request.Description,
            MinDays = request.MinDays,
            MaxDays = request.MaxDays,
            IsActive = true
        };

        await unitOfWork.ProcurementActivityTypeRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "Procurement activity type created successfully.");
    }
}
