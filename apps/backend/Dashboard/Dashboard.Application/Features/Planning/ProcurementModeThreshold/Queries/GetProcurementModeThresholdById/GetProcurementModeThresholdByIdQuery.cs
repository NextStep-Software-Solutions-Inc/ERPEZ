using ERPEZ.Application.Features.Planning.ProcurementModeThreshold.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementModeThreshold.Queries.GetProcurementModeThresholdById;

public record GetProcurementModeThresholdByIdQuery(Guid Id) : IRequest<ApiResponse<ProcurementModeThresholdResponse>>;
