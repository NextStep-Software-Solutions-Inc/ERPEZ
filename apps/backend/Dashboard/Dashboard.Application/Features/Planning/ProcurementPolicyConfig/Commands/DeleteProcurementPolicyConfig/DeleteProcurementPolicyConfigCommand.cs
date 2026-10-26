using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementPolicyConfig.Commands.DeleteProcurementPolicyConfig;

public record DeleteProcurementPolicyConfigCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
