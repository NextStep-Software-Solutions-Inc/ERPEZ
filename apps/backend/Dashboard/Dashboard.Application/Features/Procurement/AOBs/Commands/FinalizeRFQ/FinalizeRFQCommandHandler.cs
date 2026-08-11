using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.FinalizeRFQ;

public class FinalizeRFQCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<FinalizeRFQCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(FinalizeRFQCommand request, CancellationToken cancellationToken)
    {
        var project = await unitOfWork.ProcurementProjectRepository.GetByIdAsync(request.ProcurementProjectId, cancellationToken);
        if (project == null)
        {
            return ApiResponse<Unit>.Fail("Procurement project (RFQ) not found.");
        }

        // Simulating RFQ finalization routing to Supplier portals via status transitions
        project.Status = "ROUTED_TO_PORTAL";

        unitOfWork.ProcurementProjectRepository.Update(project);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "RFQ has been successfully finalized and routed to the Supplier Portal.");
    }
}
