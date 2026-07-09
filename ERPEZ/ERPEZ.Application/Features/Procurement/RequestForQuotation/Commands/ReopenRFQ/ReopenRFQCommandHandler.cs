using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
 
namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.ReopenRFQ;
 
public class ReopenRFQCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<ReopenRFQCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(ReopenRFQCommand request, CancellationToken cancellationToken)
    {
        var rfq = await unitOfWork.RFQRepository.GetByIdAsync(request.RFQId, cancellationToken);
        if (rfq is null)
        {
            return ApiResponse<bool>.Fail("RFQ not found.");
        }
 
        if (rfq.Status != StatusEnum.Returned)
        {
            return ApiResponse<bool>.Fail($"Only Returned RFQs can be reopened. Current status: {rfq.Status}.");
        }
 
        rfq.Status = StatusEnum.Draft;
 
        unitOfWork.RFQRepository.Update(rfq);
        await unitOfWork.SaveChangesAsync(cancellationToken);
 
        return ApiResponse<bool>.Success(true, "RFQ reopened as Draft.");
    }
}
