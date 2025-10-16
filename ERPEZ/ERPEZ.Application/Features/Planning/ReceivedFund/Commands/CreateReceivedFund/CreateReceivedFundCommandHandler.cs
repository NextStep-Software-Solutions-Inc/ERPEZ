using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ReceivedFund.Commands.CreateReceivedFund;

public class CreateReceivedFundCommandHandler(IUnitOfWork _unitOfWork)
    : IRequestHandler<CreateReceivedFundCommand, ApiResponse<Domain.Entities.Planning.ReceivedFund>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.ReceivedFund>> Handle(CreateReceivedFundCommand request, CancellationToken cancellationToken)
    {
        if (request.FundSourceId == Guid.Empty)
        {
            return new ApiResponse<Domain.Entities.Planning.ReceivedFund>
            {
                Message = "Received Fund is required.",
                Succeeded = false
            };
        }
        var fundSourceIdExist = await _unitOfWork.FundSourceRepository.GetByIdAsync(request.FundSourceId, cancellationToken) ?? throw new NotFoundException("Fund Source not found.");
        var receivedFund = new Domain.Entities.Planning.ReceivedFund
        {
            FundSourceId = request.FundSourceId,
            Amount = request.Amount
        };

        await _unitOfWork.ReceivedFundRepository.AddAsync(receivedFund, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
        var dto = new Domain.Entities.Planning.ReceivedFund
        {
            Amount = request.Amount,
            FundSourceId = request.FundSourceId
        };
        return ApiResponse<Domain.Entities.Planning.ReceivedFund>.Success(dto, "Received Fund created successfully.");
    }
}