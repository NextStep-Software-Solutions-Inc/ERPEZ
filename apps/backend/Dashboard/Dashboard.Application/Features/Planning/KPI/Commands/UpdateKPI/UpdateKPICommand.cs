using ERPEZ.Application.Features.Planning.KPI.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.UpdateKPI;

public record UpdateKPICommand(Guid Id, UpdateKPIRequest Dto) : IRequest<ApiResponse<Unit>>;
