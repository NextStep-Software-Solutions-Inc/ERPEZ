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
        // Validate existing entity
        var entity = await unitOfWork.SupplierRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Supplier not found.");

        // Validate SupplierCategory exists
        _ = await unitOfWork.SupplierCategoryRepository.GetByIdAsync(request.SupplierCategoryId, cancellationToken)
            ?? throw new NotFoundException("Supplier category not found.");

        // Check for duplicate TIN Number (excluding current supplier)
        if (await unitOfWork.SupplierRepository.ExistsByTINAsync(request.TINNumber, request.Id, cancellationToken))
            throw new ConflictException($"A supplier with TIN Number '{request.TINNumber}' already exists.");

        // Check for duplicate Business Permit (excluding current supplier)
        if (await unitOfWork.SupplierRepository.ExistsByBusinessPermitAsync(request.BusinessPermitNo, request.Id, cancellationToken))
            throw new ConflictException($"A supplier with Business Permit Number '{request.BusinessPermitNo}' already exists.");

        // Validate supplier status can only be Approved if requirements are verified
        if (request.Status == nameof(SupplierStatusEnum.Approved))
        {
            var allVerified = await unitOfWork.SupplierRequirementRepository.AllMandatoryRequirementsVerifiedAsync(
                request.Id, cancellationToken);

            if (!allVerified)
                throw new ConflictException("Cannot approve supplier. All mandatory requirements must be verified.");
        }

        // Update entity
        entity.Name = request.Name;
        entity.BusinessPermitNo = request.BusinessPermitNo;
        entity.ContactPerson = request.ContactPerson;
        entity.ContactNumber = request.ContactNumber;
        entity.Address = request.Address;
        entity.Email = request.Email;
        entity.TINNumber = request.TINNumber;
        entity.PhilGEPSNumber = request.PhilGEPSNumber;
        entity.IsBlacklisted = request.IsBlacklisted;
        entity.Status = request.Status;
        entity.SupplierCategoryId = request.SupplierCategoryId;

        unitOfWork.SupplierRepository.Update(entity);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Supplier updated successfully.");
    }
}
