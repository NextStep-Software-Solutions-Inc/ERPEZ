using ERPEZ.Application.Features.Planning.Supplier.Dtos;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;
using System.Linq;

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
            IsBlocked = entity.IsBlocked,
            Status = entity.Status.ToLowerInvariant(),
            StatusNote = entity.StatusNote,
            SupplierCategoryId = entity.SupplierCategoryId,
            SupplierCategory = entity.SupplierCategory != null ? new SupplierCategoryInfo
            {
                Id = entity.SupplierCategory.Id,
                Name = entity.SupplierCategory.Name,
                Description = entity.SupplierCategory.Description
            } : null,
            SupplierRequirements = entity.SupplierRequirements.Select(sr => new SupplierRequirementDto
            {
                SupplierRequirementId = sr.Id,
                RequirementName = sr.RequirementName,
                URL = sr.URL,
                IsVerified = sr.IsVerified,
                CreatedAt = sr.CreatedAt,
                UpdatedAt = sr.UpdatedAt
            }).ToList(),
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };

        return ApiResponse<SupplierDetailedResponse>.Success(response, "Supplier retrieved successfully.");
    }
}

