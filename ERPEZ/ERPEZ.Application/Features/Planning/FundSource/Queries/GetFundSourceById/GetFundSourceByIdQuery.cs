using ERPEZ.Application.Features.Planning.FundSource.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.FundSource.Queries.GetFundSourceById;

public record GetFundSourceByIdQuery(Guid Id) : IRequest<ApiResponse<FundSourceResponse>>;
