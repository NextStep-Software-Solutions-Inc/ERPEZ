using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Supplier.Commands.ValidateSupplier;

public record ValidateSupplierRequest
{
    public Guid? Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string BusinessPermitNo { get; init; } = string.Empty;
    public string ContactPerson { get; init; } = string.Empty;
    public string ContactNumber { get; init; } = string.Empty;
    public string Address { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string TINNumber { get; init; } = string.Empty;
    public string? PhilGEPSNumber { get; init; }
    public Guid SupplierCategoryId { get; init; }
}

public record ValidateSupplierCommand(ValidateSupplierRequest Request) : IRequest<ApiResponse<bool>>;
