using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SupplierRequirement.Commands.DeleteSupplierRequirement;

public record DeleteSupplierRequirementCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
