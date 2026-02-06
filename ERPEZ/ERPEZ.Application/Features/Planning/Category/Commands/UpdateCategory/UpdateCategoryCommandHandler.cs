using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Category.Commands.UpdateCategory;

public class UpdateCategoryCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<UpdateCategoryCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await unitOfWork.CategoryRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Category not found.");

        var dto = request.UpdateCategory;

        if (dto.Code != null && dto.Code != category.Code)
        {
            var duplicate = await unitOfWork.CategoryRepository.FindAsync(
                x => x.Code == dto.Code,
                cancellationToken
            );

            if (duplicate != null && duplicate.Id != request.Id)
                throw new ConflictException("Category with this code already exists.");
        }

        category.Name = dto.Name ?? category.Name;
        category.Code = dto.Code ?? category.Code;
        if (dto.CanHaveChildren.HasValue) category.CanHaveChildren = dto.CanHaveChildren.Value;
        if (dto.IsActive.HasValue) category.IsActive = dto.IsActive.Value;

        unitOfWork.CategoryRepository.Update(category);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Category updated successfully.");
    }
}
