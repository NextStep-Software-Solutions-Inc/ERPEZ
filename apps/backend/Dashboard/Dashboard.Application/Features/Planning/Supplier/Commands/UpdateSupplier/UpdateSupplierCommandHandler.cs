using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Supplier.Commands.UpdateSupplier;

public class UpdateSupplierCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateSupplierCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateSupplierCommand request, CancellationToken cancellationToken)
    {
        var updateRequest = request.UpdateSupplier;

        // Validate existing entity
        var entity = await unitOfWork.SupplierRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Supplier not found.");

        // Validate SupplierCategory exists
        _ = await unitOfWork.SupplierCategoryRepository.GetByIdAsync(updateRequest.SupplierCategoryId, cancellationToken)
            ?? throw new NotFoundException("Supplier category not found.");

        // Check for duplicate TIN Number (excluding current supplier)
        if (await unitOfWork.SupplierRepository.ExistsByTINAsync(updateRequest.TINNumber, request.Id, cancellationToken))
            throw new ConflictException($"A supplier with TIN Number '{updateRequest.TINNumber}' already exists.");

        // Check for duplicate Business Permit (excluding current supplier)
        if (await unitOfWork.SupplierRepository.ExistsByBusinessPermitAsync(updateRequest.BusinessPermitNo, request.Id, cancellationToken))
            throw new ConflictException($"A supplier with Business Permit Number '{updateRequest.BusinessPermitNo}' already exists.");

        // Validate supplier status can only be Approved if requirements are verified
        if (updateRequest.Status == nameof(SupplierStatusEnum.Approved))
        {
            var allVerified = await unitOfWork.SupplierRequirementRepository.AllMandatoryRequirementsVerifiedAsync(
                request.Id, cancellationToken);

            if (!allVerified)
                throw new ConflictException("Cannot approve supplier. All mandatory requirements must be verified.");
        }

        // Update entity
        entity.Name = updateRequest.Name;
        entity.BusinessPermitNo = updateRequest.BusinessPermitNo;
        entity.ContactPerson = updateRequest.ContactPerson;
        entity.ContactNumber = updateRequest.ContactNumber;
        entity.Address = updateRequest.Address;
        entity.Email = updateRequest.Email;
        entity.TINNumber = updateRequest.TINNumber;
        entity.PhilGEPSNumber = updateRequest.PhilGEPSNumber;
        entity.IsBlocked = updateRequest.IsBlacklisted;
        entity.Status = updateRequest.Status;
        entity.SupplierCategoryId = updateRequest.SupplierCategoryId;

        unitOfWork.SupplierRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Supplier updated successfully.");
    }
}
