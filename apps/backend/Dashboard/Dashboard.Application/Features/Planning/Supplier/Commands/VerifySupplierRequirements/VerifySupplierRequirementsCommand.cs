using ERPEZ.Application.Features.Planning.Supplier.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Supplier.Commands.VerifySupplierRequirements;

public record VerifySupplierRequirementsCommand : IRequest<ApiResponse<Unit>>
{
    public Guid SupplierId { get; init; }
    public List<SupplierRequirementVerificationDto> Requirements { get; init; } = [];
}
