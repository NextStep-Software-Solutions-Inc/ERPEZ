using ERPEZ.Application.Features.Planning.ReceivedFund.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ReceivedFund.Commands.CreateReceivedFund;

public class CreateReceivedFundCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateReceivedFundCommand, ApiResponse<ReceivedFundDto>>
{
    public async Task<ApiResponse<ReceivedFundDto>> Handle(CreateReceivedFundCommand request, CancellationToken cancellationToken)
    {
        if (request.FundSourceId == Guid.Empty)
        {
            return new ApiResponse<ReceivedFundDto>
            {
                Message = "Received Fund is required.",
                Succeeded = false
            };
        }
        _ = await unitOfWork.FundSourceRepository.GetByIdAsync(request.FundSourceId, cancellationToken) ?? throw new NotFoundException("Fund Source not found.");
        var receivedFund = new Domain.Entities.Planning.ReceivedFund
        {
            FundSourceId = request.FundSourceId,
            Amount = request.Amount
        };

        await unitOfWork.ReceivedFundRepository.AddAsync(receivedFund, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        var receivedFundDto = new ReceivedFundDto
        {
            Id = receivedFund.Id,
            FundSourceId = receivedFund.FundSourceId,
            Amount = receivedFund.Amount
        };
        return ApiResponse<ReceivedFundDto>.Success(receivedFundDto, "Received Fund created successfully.");
    }
}
