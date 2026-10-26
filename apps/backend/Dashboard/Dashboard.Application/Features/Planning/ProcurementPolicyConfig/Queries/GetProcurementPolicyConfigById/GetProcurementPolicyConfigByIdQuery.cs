using ERPEZ.Application.Features.Planning.ProcurementPolicyConfig.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementPolicyConfig.Queries.GetProcurementPolicyConfigById;

public record GetProcurementPolicyConfigByIdQuery(Guid Id) : IRequest<ApiResponse<ProcurementPolicyConfigResponse>>;
