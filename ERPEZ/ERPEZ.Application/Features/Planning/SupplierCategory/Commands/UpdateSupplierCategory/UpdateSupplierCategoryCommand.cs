using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SupplierCategory.Commands.UpdateSupplierCategory;

public record UpdateSupplierCategoryCommand(Guid Id) : IRequest<ApiResponse<Unit>>
{
    public string Name { get; init; } = string.Empty;
    public string? Description { get; init; }
}
