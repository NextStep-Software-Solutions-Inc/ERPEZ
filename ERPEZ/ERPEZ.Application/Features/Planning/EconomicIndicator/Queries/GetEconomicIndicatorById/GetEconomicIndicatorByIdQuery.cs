using ERPEZ.Application.Features.Planning.EconomicIndicator.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.EconomicIndicator.Queries.GetEconomicIndicatorById;

public record GetEconomicIndicatorByIdQuery(Guid Id) : IRequest<ApiResponse<EconomicIndicatorResponse>>;
