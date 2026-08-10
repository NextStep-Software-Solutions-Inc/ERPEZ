using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SupplierRequirement.Commands.DeleteSupplierRequirement;

public class DeleteSupplierRequirementCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteSupplierRequirementCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteSupplierRequirementCommand request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.SupplierRequirementRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Supplier requirement not found.");

        unitOfWork.SupplierRequirementRepository.Remove(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Supplier requirement deleted successfully.");
    }
}
