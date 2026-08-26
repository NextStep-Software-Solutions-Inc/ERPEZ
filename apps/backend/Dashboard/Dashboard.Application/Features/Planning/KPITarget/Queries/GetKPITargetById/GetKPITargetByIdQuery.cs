using ERPEZ.Application.Features.Planning.KPITarget.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPITarget.Queries.GetKPITargetById;

public record GetKPITargetByIdQuery(Guid Id) : IRequest<ApiResponse<KPITargetResponse>>;
