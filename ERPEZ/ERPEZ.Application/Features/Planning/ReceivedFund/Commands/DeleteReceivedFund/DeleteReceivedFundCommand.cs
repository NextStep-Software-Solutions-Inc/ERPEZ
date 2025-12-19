using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ReceivedFund.Commands.DeleteReceivedFund;

public record DeleteReceivedFundCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
