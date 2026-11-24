using ERPEZ.Application.Features.Planning.DeliveryUnit.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Queries.GetDUByIdQuery;

public record GetDeliveryUnitByIdQuery(Guid Id) : IRequest<ApiResponse<DeliveryUnitResponse>>;
