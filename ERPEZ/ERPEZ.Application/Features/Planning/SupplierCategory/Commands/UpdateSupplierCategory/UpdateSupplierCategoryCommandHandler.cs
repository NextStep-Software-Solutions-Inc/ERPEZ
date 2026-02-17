using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SupplierCategory.Commands.UpdateSupplierCategory;

public class UpdateSupplierCategoryCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateSupplierCategoryCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateSupplierCategoryCommand request, CancellationToken cancellationToken)
    {
        // Validate existing entity
        var entity = await unitOfWork.SupplierCategoryRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Supplier category not found.");

        // Check for duplicate name (excluding current entity)
        if (await unitOfWork.SupplierCategoryRepository.ExistsByNameAsync(request.Name, request.Id, cancellationToken))
            throw new ConflictException($"Supplier category with name '{request.Name}' already exists.");

        // Update entity
        entity.Name = request.Name;
        entity.Description = request.Description;

        unitOfWork.SupplierCategoryRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Supplier category updated successfully.");
    }
}
