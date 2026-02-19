using ERPEZ.Application.Features.Planning.SupplierRequirement.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SupplierRequirement.Queries.GetSupplierRequirementById;

public record GetSupplierRequirementByIdQuery(Guid Id) : IRequest<ApiResponse<SupplierRequirementResponse>>;
