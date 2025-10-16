using ERPEZ.Application.Features.Planning.KPIAssignment.Commands.UpdateKPIAssignment;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ReceivedFund.Commands.UpdateReceivedFund;

public class UpdateReceivedFundCommandHandler(IUnitOfWork _unitOfWork) : IRequestHandler<UpdateReceivedFundCommand, ApiResponse<Domain.Entities.Planning.ReceivedFund>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.ReceivedFund>> Handle(UpdateReceivedFundCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateReceivedFund;

        if (dto.FundSourceId.HasValue && dto.FundSourceId.Value != Guid.Empty)
        {
            var du = await _unitOfWork.ReceivedFundRepository.GetByIdAsync(dto.FundSourceId.Value, cancellationToken: cancellationToken)
                ?? throw new NotFoundException("Received Fund not found.");
        }

        var receivedFund = await _unitOfWork.ReceivedFundRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken)
            ?? throw new NotFoundException("Received Fund not found.");
        
        receivedFund.FundSourceId = dto?.FundSourceId ?? receivedFund.FundSourceId;
        receivedFund.Amount = dto?.Amount ?? receivedFund.Amount;

        _unitOfWork.ReceivedFundRepository.Update(receivedFund);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.ReceivedFund>.Success(receivedFund, "KPI Assignment updated successfully.");
    }
}