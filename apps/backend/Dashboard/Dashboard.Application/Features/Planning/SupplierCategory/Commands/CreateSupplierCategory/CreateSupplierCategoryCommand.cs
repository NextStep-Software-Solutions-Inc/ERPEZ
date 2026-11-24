using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SupplierCategory.Commands.CreateSupplierCategory;

public record CreateSupplierCategoryCommand : IRequest<ApiResponse<Guid>>
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
}
