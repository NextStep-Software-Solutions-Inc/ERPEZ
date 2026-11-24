using ERPEZ.Application.Features.Planning.Supplier.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Supplier.Commands.UpdateSupplier;

public record UpdateSupplierCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public required UpdateSupplierRequest UpdateSupplier { get; init; }
}
