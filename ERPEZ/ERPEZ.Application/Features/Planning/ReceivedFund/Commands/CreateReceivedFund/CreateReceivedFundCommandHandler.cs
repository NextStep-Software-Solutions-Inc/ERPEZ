using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ReceivedFund.Commands.CreateReceivedFund;

public class CreateReceivedFundCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateReceivedFundCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(CreateReceivedFundCommand request, CancellationToken cancellationToken)
    {

        _ = await unitOfWork.FundSourceRepository.GetByIdAsync(request.FundSourceId, cancellationToken) ?? throw new NotFoundException("Fund Source not found.");
        var receivedFund = new Domain.Entities.Planning.ReceivedFund
        {
            FundSourceId = request.FundSourceId,
            Amount = request.Amount,
            ReceivedDate = request.ReceivedDate,
            Description = request.Description
        };

        await unitOfWork.ReceivedFundRepository.AddAsync(receivedFund, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<Unit>.Success(Unit.Value, "Received Fund created successfully.");
    }
}
