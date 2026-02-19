using ERPEZ.Application.Features.Planning.SupplierRequirement.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;

namespace ERPEZ.Application.Features.Planning.SupplierRequirement.Queries.GetSupplierRequirements;

public record GetSupplierRequirementsQuery(SieveModel SieveModel) : IRequest<PaginatedApiResponse<SupplierRequirementResponse>>;
