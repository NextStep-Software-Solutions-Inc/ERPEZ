using ERPEZ.Application.Features.Planning.Supplier.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Supplier.Commands.PatchSupplier;

public record PatchSupplierCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public required PatchSupplierRequestDto PatchSupplier { get; init; }
}
