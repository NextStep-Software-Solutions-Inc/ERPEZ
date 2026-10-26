using ERPEZ.Application.Features.Planning.SupplierRequirement.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SupplierRequirement.Commands.UpdateSupplierRequirement;

public record UpdateSupplierRequirementCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public required UpdateSupplierRequirementRequest UpdateSupplierRequirement { get; init; }
}
