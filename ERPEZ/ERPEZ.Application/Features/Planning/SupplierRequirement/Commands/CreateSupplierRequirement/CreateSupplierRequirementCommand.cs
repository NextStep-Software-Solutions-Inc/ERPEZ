using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SupplierRequirement.Commands.CreateSupplierRequirement;

public record CreateSupplierRequirementCommand : IRequest<ApiResponse<Guid>>
{
    public Guid SupplierId { get; init; }
    public string RequirementName { get; init; } = string.Empty;
    public string URL { get; init; } = string.Empty;
    public bool IsVerified { get; init; }
}
