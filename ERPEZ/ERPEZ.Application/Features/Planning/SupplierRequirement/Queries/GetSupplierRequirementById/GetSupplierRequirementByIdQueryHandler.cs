using ERPEZ.Application.Features.Planning.SupplierRequirement.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SupplierRequirement.Queries.GetSupplierRequirementById;

public class GetSupplierRequirementByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetSupplierRequirementByIdQuery, ApiResponse<SupplierRequirementResponse>>
{
    public async Task<ApiResponse<SupplierRequirementResponse>> Handle(GetSupplierRequirementByIdQuery request, CancellationToken cancellationToken)
    {
        var entity = await unitOfWork.SupplierRequirementRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Supplier requirement not found.");

        var response = new SupplierRequirementResponse
        {
            Id = entity.Id,
            SupplierId = entity.SupplierId,
            RequirementName = entity.RequirementName,
            Url = entity.Url,
            IsVerified = entity.IsVerified,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };

        return ApiResponse<SupplierRequirementResponse>.Success(response, "Supplier requirement retrieved successfully.");
    }
}
