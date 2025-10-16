using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ReceivedFund.Commands.CreateReceivedFund;

public class CreateReceivedFundCommand : IRequest<ApiResponse<Domain.Entities.Planning.ReceivedFund>>
{
    public Guid FundSourceId { get; set; }
    public decimal Amount { get; set; }
}
