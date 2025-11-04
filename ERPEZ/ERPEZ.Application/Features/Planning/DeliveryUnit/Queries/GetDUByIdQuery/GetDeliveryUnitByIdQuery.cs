using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.DeliveryUnit.Queries.GetDUByIdQuery;

public record GetDeliveryUnitByIdQuery(Guid Id) : IRequest<ApiResponse<Domain.Entities.Planning.DeliveryUnit>>;
