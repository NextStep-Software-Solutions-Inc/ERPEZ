using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Supplier.Commands.UpdateSupplier;

public record UpdateSupplierCommand(Guid Id) : IRequest<ApiResponse<Unit>>
{
    public string Name { get; init; } = string.Empty;
    public string BusinessPermitNo { get; init; } = string.Empty;
    public string ContactPerson { get; init; } = string.Empty;
    public string ContactNumber { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string TINNumber { get; init; } = string.Empty;
    public string? PhilGEPSNumber { get; init; }
    public bool IsBlacklisted { get; init; }
    public string Status { get; init; } = string.Empty;
    public Guid SupplierCategoryId { get; init; }
}
