using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Supplier.Commands.ValidateSupplier;

public class ValidateSupplierCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<ValidateSupplierCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(ValidateSupplierCommand request, CancellationToken cancellationToken)
    {
        var req = request.Request;

        if (req == null)
            throw new BadRequestException("Supplier information is required.");

        if (string.IsNullOrWhiteSpace(req.Name))
            throw new BadRequestException("Supplier name is required.");

        if (string.IsNullOrWhiteSpace(req.BusinessPermitNo))
            throw new BadRequestException("Business permit number is required.");

        if (string.IsNullOrWhiteSpace(req.ContactPerson))
            throw new BadRequestException("Contact person is required.");

        if (string.IsNullOrWhiteSpace(req.ContactNumber))
            throw new BadRequestException("Contact number is required.");

        if (string.IsNullOrWhiteSpace(req.Address))
            throw new BadRequestException("Address is required.");

        if (string.IsNullOrWhiteSpace(req.Email))
            throw new BadRequestException("Email is required.");

        if (string.IsNullOrWhiteSpace(req.TINNumber))
            throw new BadRequestException("TIN number is required.");

        if (req.SupplierCategoryId == Guid.Empty)
            throw new BadRequestException("Supplier category is required.");

        // Validate SupplierCategory exists
        _ = await unitOfWork.SupplierCategoryRepository.GetByIdAsync(req.SupplierCategoryId, cancellationToken)
            ?? throw new NotFoundException("Supplier category not found.");

        // Check for duplicate TIN Number
        if (await unitOfWork.SupplierRepository.ExistsByTINAsync(req.TINNumber, req.Id, cancellationToken))
            throw new ConflictException($"A supplier with TIN Number '{req.TINNumber}' already exists.");

        // Check for duplicate Business Permit
        if (await unitOfWork.SupplierRepository.ExistsByBusinessPermitAsync(req.BusinessPermitNo, req.Id, cancellationToken))
            throw new ConflictException($"A supplier with Business Permit Number '{req.BusinessPermitNo}' already exists.");

        return ApiResponse<bool>.Success(true, "Supplier details are valid for submission.");
    }
}
