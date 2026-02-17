using ERPEZ.Application.Features.Planning.Supplier.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Supplier.Queries.GetSupplierById;

public class GetSupplierByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetSupplierByIdQuery, ApiResponse<SupplierDetailedResponse>>
{
    public async Task<ApiResponse<SupplierDetailedResponse>> Handle(GetSupplierByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.SupplierRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Supplier not found.");

        var response = new SupplierDetailedResponse
        {
            Id = entity.Id,
            Name = entity.Name,
            BusinessPermitNo = entity.BusinessPermitNo,
            ContactPerson = entity.ContactPerson,
            ContactNumber = entity.ContactNumber,
            Address = entity.Address,
            Email = entity.Email,
            TINNumber = entity.TINNumber,
            PhilGEPSNumber = entity.PhilGEPSNumber,
            IsBlacklisted = entity.IsBlacklisted,
            Status = entity.Status,
            SupplierCategoryId = entity.SupplierCategoryId,
            SupplierCategory = entity.SupplierCategory != null ? new SupplierCategoryInfo
            {
                Id = entity.SupplierCategory.Id,
                Name = entity.SupplierCategory.Name,
                Description = entity.SupplierCategory.Description
            } : null,
            SupplierRequirements = entity.SupplierRequirements.Select(sr => new SupplierRequirementInfo
            {
                Id = sr.Id,
                RequirementName = sr.RequirementName,
                URL = sr.URL,
                IsVerified = sr.IsVerified,
                CreatedAt = sr.CreatedAt
            }).ToList(),
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };

        return ApiResponse<SupplierDetailedResponse>.Success(response, "Supplier retrieved successfully.");
    }
}
