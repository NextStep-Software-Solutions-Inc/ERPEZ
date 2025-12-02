using ERPEZ.Application.Features.Planning.ReceivedFund.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ReceivedFund.Commands.UpdateReceivedFund;

public record UpdateReceivedFundCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public required UpdateReceivedFundRequest UpdateReceivedFund { get; init; }
}


