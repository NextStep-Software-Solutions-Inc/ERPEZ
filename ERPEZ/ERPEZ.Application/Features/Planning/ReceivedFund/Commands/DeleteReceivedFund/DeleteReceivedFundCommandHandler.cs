using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ReceivedFund.Commands.DeleteReceivedFund;

public class DeleteReceivedFundCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<DeleteReceivedFundCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteReceivedFundCommand request, CancellationToken cancellationToken)
    {
        var receivedFund = await unitOfWork.ReceivedFundRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Received Fund not found.");

        unitOfWork.ReceivedFundRepository.Remove(receivedFund);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Received Fund with ID {request.Id} deleted successfully.");
    }
}
