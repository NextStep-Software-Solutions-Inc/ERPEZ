using ERPEZ.Application.Features.Planning.ProcurementMode.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementMode.Queries.GetProcurementModeById;

public record GetProcurementModeByIdQuery(Guid Id) : IRequest<ApiResponse<ProcurementModeResponse>>;
