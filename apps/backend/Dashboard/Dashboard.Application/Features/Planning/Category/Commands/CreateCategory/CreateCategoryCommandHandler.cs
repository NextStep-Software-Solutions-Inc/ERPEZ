using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Category.Commands.CreateCategory;

public class CreateCategoryCommandHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<CreateCategoryCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        var duplicate = await unitOfWork.CategoryRepository.FindAsync(
            x => x.Code == request.Code, 
            cancellationToken);
        
        if (duplicate != null) 
            throw new ConflictException("Category with this code already exists.");

        var category = new Domain.Entities.Planning.Category
        {
            Name = request.Name,
            Code = request.Code,
            CanHaveChildren = request.CanHaveChildren,
            IsActive = true
        };

        await unitOfWork.CategoryRepository.AddAsync(category, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(category.Id, "Category created successfully.");
    }
}
