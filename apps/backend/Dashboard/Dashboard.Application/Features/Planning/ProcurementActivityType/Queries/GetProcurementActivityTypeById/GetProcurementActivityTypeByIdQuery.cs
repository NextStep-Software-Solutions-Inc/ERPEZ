using ERPEZ.Application.Features.Planning.ProcurementActivityType.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementActivityType.Queries.GetProcurementActivityTypeById;

public record GetProcurementActivityTypeByIdQuery(Guid Id) : IRequest<ApiResponse<ProcurementActivityTypeResponse>>;
