using ERPEZ.Application.Features.Planning.Supplier.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Supplier.Queries.GetSuppliers;

public class GetSuppliersQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetSuppliersQuery, PaginatedApiResponse<SupplierResponse>>
{
    public async Task<PaginatedApiResponse<SupplierResponse>> Handle(GetSuppliersQuery request, CancellationToken cancellationToken)
    {
        System.Linq.Expressions.Expression<Func<Domain.Entities.Planning.Supplier, SupplierResponse>> projection = s => new SupplierResponse
        {
            Id = s.Id,
            Name = s.Name,
            BusinessPermitNo = s.BusinessPermitNo,
            ContactPerson = s.ContactPerson,
            ContactNumber = s.ContactNumber,
            Email = s.Email,
            TINNumber = s.TINNumber,
            PhilGEPSNumber = s.PhilGEPSNumber,
            IsBlacklisted = s.IsBlacklisted,
            Status = s.Status,
            SupplierCategoryId = s.SupplierCategoryId,
            SupplierCategoryName = s.SupplierCategory != null ? s.SupplierCategory.Name : string.Empty,
            CreatedAt = s.CreatedAt,
            UpdatedAt = s.UpdatedAt
        };

        var (items, totalCount) = await unitOfWork.SupplierRepository.GetAllAsync(
            request.SieveModel,
            projection,
            cancellationToken: cancellationToken
        );

        return new PaginatedApiResponse<SupplierResponse>(
            [.. items],
            request.SieveModel.Page ?? 1,
            request.SieveModel.PageSize ?? 10,
            totalCount
        );
    }
}
