using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ReceivedFund.Commands.UpdateReceivedFund;

public class UpdateReceivedFundCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateReceivedFundCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateReceivedFundCommand request, CancellationToken cancellationToken)
    {
        var receivedFundDto = request.UpdateReceivedFund;

        var receivedFund = await unitOfWork.ReceivedFundRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Received Fund not found.");
        
        receivedFund.Amount = receivedFundDto?.Amount ?? receivedFund.Amount;
        receivedFund.ReceivedDate = receivedFundDto?.ReceivedDate ?? receivedFund.ReceivedDate;
        receivedFund.Description = receivedFundDto?.Description ?? receivedFund.Description;

        unitOfWork.ReceivedFundRepository.Update(receivedFund);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Received Fund updated successfully.");
    }
}
