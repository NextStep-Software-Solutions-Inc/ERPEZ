using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Supplier.Commands.CreateSupplier;

public class CreateSupplierCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateSupplierCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateSupplierCommand request, CancellationToken cancellationToken)
    {
        // Validate SupplierCategory exists
        _ = await unitOfWork.SupplierCategoryRepository.GetByIdAsync(request.SupplierCategoryId, cancellationToken)
            ?? throw new NotFoundException("Supplier category not found.");

        // Check for duplicate TIN Number
        if (await unitOfWork.SupplierRepository.ExistsByTINAsync(request.TINNumber, null, cancellationToken))
            throw new ConflictException($"A supplier with TIN Number '{request.TINNumber}' already exists.");

        // Check for duplicate Business Permit
        if (await unitOfWork.SupplierRepository.ExistsByBusinessPermitAsync(request.BusinessPermitNo, null, cancellationToken))
            throw new ConflictException($"A supplier with Business Permit Number '{request.BusinessPermitNo}' already exists.");

        var entity = new Domain.Entities.Planning.Supplier
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            BusinessPermitNo = request.BusinessPermitNo,
            ContactPerson = request.ContactPerson,
            ContactNumber = request.ContactNumber,
            Address = request.Address,
            Email = request.Email,
            TINNumber = request.TINNumber,
            PhilGEPSNumber = request.PhilGEPSNumber,
            SupplierCategoryId = request.SupplierCategoryId,
            Status = nameof(SupplierStatusEnum.Pending),
            IsBlocked = false
        };

        await unitOfWork.SupplierRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "Supplier created successfully.");
    }
}
