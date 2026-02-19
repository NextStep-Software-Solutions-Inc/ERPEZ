using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SupplierRequirement.Commands.UpdateSupplierRequirement;

public class UpdateSupplierRequirementCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateSupplierRequirementCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateSupplierRequirementCommand request, CancellationToken cancellationToken)
    {
        var updateRequest = request.UpdateSupplierRequirement;

        var entity = await unitOfWork.SupplierRequirementRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Supplier requirement not found.");

        entity.RequirementName = updateRequest.RequirementName;
        entity.URL = updateRequest.URL;
        entity.IsVerified = updateRequest.IsVerified;

        unitOfWork.SupplierRequirementRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Supplier requirement updated successfully.");
    }
}
