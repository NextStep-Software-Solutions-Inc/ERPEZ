using ERPEZ.Application.Features.Planning.KPI.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPI.Commands.UpdateKPI;

public record UpdateKPICommand(UpdateKPIRequest Dto, Guid Id) : UpdateKPIRequest, IRequest<ApiResponse<Unit>>;
