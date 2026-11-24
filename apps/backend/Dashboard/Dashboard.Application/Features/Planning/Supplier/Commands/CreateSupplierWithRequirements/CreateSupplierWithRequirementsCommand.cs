using ERPEZ.Application.Features.Planning.Supplier.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Supplier.Commands.CreateSupplierWithRequirements;

public record CreateSupplierWithRequirementsCommand : IRequest<ApiResponse<Guid>>
{
    public CreateSupplierWithRequirementsRequest CreateSupplierRequest { get; init; } = new();
}
