using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SupplierCategory.Commands.CreateSupplierCategory;

public class CreateSupplierCategoryCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateSupplierCategoryCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateSupplierCategoryCommand request, CancellationToken cancellationToken)
    {
        // Check for duplicate name
        if (await unitOfWork.SupplierCategoryRepository.ExistsByNameAsync(request.Name, null, cancellationToken))
            throw new ConflictException($"Supplier category with name '{request.Name}' already exists.");

        var entity = new Domain.Entities.Planning.SupplierCategory
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description
        };

        await unitOfWork.SupplierCategoryRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "Supplier category created successfully.");
    }
}
