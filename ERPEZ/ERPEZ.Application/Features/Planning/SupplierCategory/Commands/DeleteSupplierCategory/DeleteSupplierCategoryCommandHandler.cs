using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SupplierCategory.Commands.DeleteSupplierCategory;

public class DeleteSupplierCategoryCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteSupplierCategoryCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteSupplierCategoryCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.SupplierCategoryRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Supplier category not found.");

        unitOfWork.SupplierCategoryRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Supplier category deleted successfully.");
    }
}
