using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Supplier.Commands.VerifySupplierRequirements;

public class VerifySupplierRequirementsCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<VerifySupplierRequirementsCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(VerifySupplierRequirementsCommand request, CancellationToken cancellationToken)
    {
        // Verify supplier exists
        _ = await unitOfWork.SupplierRepository.GetByIdAsync(request.SupplierId, cancellationToken)
            ?? throw new NotFoundException("Supplier not found.");

        var updateCount = 0;
        foreach (var requirementRequest in request.Requirements)
        {
            var requirement = await unitOfWork.SupplierRequirementRepository.GetByIdAsync(requirementRequest.SupplierRequirementId, cancellationToken)
                ?? throw new NotFoundException($"Supplier requirement with ID '{requirementRequest.SupplierRequirementId}' not found.");

            if (requirement.SupplierId != request.SupplierId)
                throw new ConflictException($"Supplier requirement with ID '{requirementRequest.SupplierRequirementId}' does not belong to the specified supplier.");

            if (requirement.IsVerified != requirementRequest.IsVerified)
            {
                requirement.IsVerified = requirementRequest.IsVerified;
                unitOfWork.SupplierRequirementRepository.Update(requirement);
                updateCount++;
            }
        }

        if (updateCount == 0)
            return ApiResponse<Unit>.Success(Unit.Value, "No requirement verification changes were necessary.");

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<Unit>.Success(Unit.Value, $"{updateCount} requirement(s) updated successfully.");
    }
}
