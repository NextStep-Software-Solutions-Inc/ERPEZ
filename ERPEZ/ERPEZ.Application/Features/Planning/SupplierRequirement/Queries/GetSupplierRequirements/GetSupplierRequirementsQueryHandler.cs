using ERPEZ.Application.Features.Planning.SupplierRequirement.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.SupplierRequirement.Queries.GetSupplierRequirements;

public class GetSupplierRequirementsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetSupplierRequirementsQuery, PaginatedApiResponse<SupplierRequirementResponse>>
{
    public async Task<PaginatedApiResponse<SupplierRequirementResponse>> Handle(GetSupplierRequirementsQuery request, CancellationToken cancellationToken)
    {
        Expression<Func<Domain.Entities.Planning.SupplierRequirement, SupplierRequirementResponse>> projection = sr => new SupplierRequirementResponse
        {
            Id = sr.Id,
            SupplierId = sr.SupplierId,
            RequirementName = sr.RequirementName,
            URL = sr.URL,
            IsVerified = sr.IsVerified,
            CreatedAt = sr.CreatedAt,
            UpdatedAt = sr.UpdatedAt
        };

        var (items, totalCount) = await unitOfWork.SupplierRequirementRepository.GetAllAsync(
            request.SieveModel,
            projection,
            cancellationToken: cancellationToken
        );

        return new PaginatedApiResponse<SupplierRequirementResponse>(
            [.. items],
            request.SieveModel.Page ?? 1,
            request.SieveModel.PageSize ?? 10,
            totalCount
        );
    }
}
