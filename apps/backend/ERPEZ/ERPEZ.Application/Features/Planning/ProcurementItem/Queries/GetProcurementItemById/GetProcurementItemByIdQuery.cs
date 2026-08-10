using ERPEZ.Application.Features.Planning.ProcurementItem.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementItem.Queries.GetProcurementItemById;

public record GetProcurementItemByIdQuery(Guid Id) : IRequest<ApiResponse<ProcurementItemResponse>>;
