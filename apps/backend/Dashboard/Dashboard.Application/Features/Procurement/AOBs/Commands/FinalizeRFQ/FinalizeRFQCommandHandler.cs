using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.FinalizeRFQ;

public class FinalizeRFQCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<FinalizeRFQCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(FinalizeRFQCommand request, CancellationToken cancellationToken)
    {
        var rfq = await unitOfWork.RFQRepository.Query()
            .Include(r => r.RFQItems)
            .Include(r => r.RFQSuppliers)
            .FirstOrDefaultAsync(r => r.Id == request.RFQId && !r.IsDeleted, cancellationToken);

        if (rfq == null)
        {
            return ApiResponse<Unit>.Fail("Request for Quotation (RFQ) not found.");
        }

        if (rfq.RFQItems.Count == 0)
        {
            return ApiResponse<Unit>.Fail("Cannot finalize an RFQ with no line items.");
        }

        if (rfq.RFQSuppliers.Count == 0)
        {
            return ApiResponse<Unit>.Fail("Cannot finalize an RFQ with no invited suppliers.");
        }

        // RFQ finalization transitions to Submitted/Approved for portal routing
        if (rfq.Status == StatusEnum.Draft)
        {
            rfq.Status = StatusEnum.Submitted;
            rfq.UpdatedAt = DateTime.UtcNow;
            rfq.UpdatedBy = "System";

            unitOfWork.RFQRepository.Update(rfq);
            await unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return ApiResponse<Unit>.Success(Unit.Value, "RFQ has been successfully finalized and routed to the Supplier Portal.");
    }
}
