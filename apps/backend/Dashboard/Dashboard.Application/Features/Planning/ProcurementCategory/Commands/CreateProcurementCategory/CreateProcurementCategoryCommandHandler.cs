using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementCategory.Commands.CreateProcurementCategory;

public class CreateProcurementCategoryCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateProcurementCategoryCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateProcurementCategoryCommand request, CancellationToken cancellationToken)
    {
        // Check for duplicates
        var existing = await unitOfWork.ProcurementCategoryRepository.FindAsync(
            x => x.Name == request.Name && !x.IsDeleted,
            cancellationToken
        );

        if (existing != null)
            throw new ConflictException($"Procurement category with name '{request.Name}' already exists.");

        var entity = new Domain.Entities.Planning.ProcurementCategory
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description
        };

        await unitOfWork.ProcurementCategoryRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "Procurement category created successfully.");
    }
}
