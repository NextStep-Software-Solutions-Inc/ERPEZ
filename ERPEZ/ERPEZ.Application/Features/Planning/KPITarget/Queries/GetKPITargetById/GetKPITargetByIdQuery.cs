using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPITarget.Queries.GetKPITargetById;

public record class GetKPITargetByIdQuery(Guid Id) : IRequest<ApiResponse<Domain.Entities.Planning.KPITarget>>;