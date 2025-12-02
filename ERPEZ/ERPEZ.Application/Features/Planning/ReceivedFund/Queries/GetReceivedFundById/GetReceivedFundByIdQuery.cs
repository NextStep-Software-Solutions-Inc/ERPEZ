using ERPEZ.Application.Features.Planning.ReceivedFund.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ReceivedFund.Queries.GetReceivedFundById;

public record GetReceivedFundByIdQuery(Guid Id) : IRequest<ApiResponse<ReceivedFundResponse>>
{
};
