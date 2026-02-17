using ERPEZ.Application.Features.Planning.SupplierCategory.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SupplierCategory.Commands.UpdateSupplierCategory;

public record UpdateSupplierCategoryCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public required UpdateSupplierCategoryRequest UpdateSupplierCategory { get; init; }
}
