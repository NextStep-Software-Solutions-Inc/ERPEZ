using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ReceivedFund.Commands.DeleteReceivedFund;

public record class DeleteReceivedFundCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
