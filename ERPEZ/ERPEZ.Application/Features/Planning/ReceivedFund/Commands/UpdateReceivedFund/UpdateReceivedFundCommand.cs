using ERPEZ.Application.Features.Planning.ReceivedFund.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ReceivedFund.Commands.UpdateReceivedFund;

public class UpdateReceivedFundCommand : IRequest<ApiResponse<Domain.Entities.Planning.ReceivedFund>>
{
    public Guid Id { get; set; }
    public required UpdateReceivedFundDto UpdateReceivedFund { get; set; }
}


