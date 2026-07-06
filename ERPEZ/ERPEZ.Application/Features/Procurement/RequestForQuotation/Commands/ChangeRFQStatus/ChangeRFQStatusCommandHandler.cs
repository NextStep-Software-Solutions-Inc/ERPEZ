using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.ChangeRFQStatus;

public class ChangeRFQStatusCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<ChangeRFQStatusCommand, ApiResponse<bool>>
{
    public async Task<ApiResponse<bool>> Handle(ChangeRFQStatusCommand request, CancellationToken cancellationToken)
    {
        var rfq = await unitOfWork.RFQRepository.GetByIdAsync(request.RFQId, cancellationToken);
        if (rfq is null)
        {
            return ApiResponse<bool>.Fail("RFQ not found.");
        }

        if (rfq.Status != StatusEnum.Submitted)
        {
            return ApiResponse<bool>.Fail(
                $"Only RFQs in Submitted (For Approval) status can be approved or returned. Current status: {rfq.Status}.");
        }

        rfq.Status = request.Status;

        unitOfWork.RFQRepository.Update(rfq);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<bool>.Success(true, request.Status == StatusEnum.Approved
            ? "RFQ approved."
            : "RFQ returned.");
    }
}
