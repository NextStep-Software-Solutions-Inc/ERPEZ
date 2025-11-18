using ERPEZ.Application.Features.Planning.ReceivedFund.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ReceivedFund.Commands.CreateReceivedFund;

public class CreateReceivedFundCommand : IRequest<ApiResponse<Unit>>
{
    public Guid FundSourceId { get; set; }
    public decimal Amount { get; set; }
    public DateTime ReceivedDate { get; set; }
    public string? Description { get; set; }
}
