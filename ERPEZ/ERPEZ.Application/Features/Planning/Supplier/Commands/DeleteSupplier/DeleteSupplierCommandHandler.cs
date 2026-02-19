using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Supplier.Commands.DeleteSupplier;

public class DeleteSupplierCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteSupplierCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteSupplierCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.SupplierRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Supplier not found.");

        unitOfWork.SupplierRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Supplier deleted successfully.");
    }
}
