using ERPEZ.Application.Features.Planning.FYActiveKPI.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FYActiveKPI.Commands.SetTargets;

public record SetFYActiveKPITargetsCommand(List<SetTargetRequest> Targets) : IRequest<ApiResponse<int>>;
