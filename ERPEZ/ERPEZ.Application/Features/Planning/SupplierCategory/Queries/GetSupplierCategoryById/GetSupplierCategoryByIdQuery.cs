using ERPEZ.Application.Features.Planning.SupplierCategory.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SupplierCategory.Queries.GetSupplierCategoryById;

public record GetSupplierCategoryByIdQuery(Guid Id) : IRequest<ApiResponse<SupplierCategoryResponse>>;
