using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ReceivedFund.Commands.CreateReceivedFund;

public record CreateReceivedFundCommand : IRequest<ApiResponse<Guid>>
{
    public Guid FundSourceId { get; set; }
    public decimal Amount { get; set; }
    public DateTime ReceivedDate { get; set; }
    public string? Description { get; set; }
}
