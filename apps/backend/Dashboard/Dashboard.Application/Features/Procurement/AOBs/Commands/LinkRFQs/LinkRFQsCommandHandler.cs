using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.LinkRFQs;

public class LinkRFQsCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<LinkRFQsCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(LinkRFQsCommand request, CancellationToken cancellationToken)
    {
        var aob = await unitOfWork.AOBRepository.Query()
            .Include(a => a.AOBRFQMappings)
            .FirstOrDefaultAsync(a => a.Id == request.AOBId && !a.IsDeleted, cancellationToken);

        if (aob == null)
        {
            return ApiResponse<Unit>.Fail("Abstract of Bids (AOB) not found.");
        }

        if (aob.Status != StatusEnum.Draft && aob.Status != StatusEnum.Returned)
        {
            return ApiResponse<Unit>.Fail($"Cannot link RFQs to an AOB in status '{aob.Status}'.");
        }

        var existingApprovedRfqIds = await unitOfWork.RFQRepository.Query()
            .Where(r => request.RFQIds.Contains(r.Id) && r.Status == StatusEnum.Approved)
            .Select(r => r.Id)
            .ToListAsync(cancellationToken);

        var invalidOrUnapprovedIds = request.RFQIds.Except(existingApprovedRfqIds).ToList();
        if (invalidOrUnapprovedIds.Count > 0)
        {
            return ApiResponse<Unit>.Fail($"Only approved RFQs can be linked to an AOB. The following RFQ ID(s) do not exist or are not approved: {string.Join(", ", invalidOrUnapprovedIds)}");
        }

        var alreadyMappedIds = aob.AOBRFQMappings.Select(m => m.RFQId).ToHashSet();
        foreach (var rfqId in request.RFQIds)
        {
            if (!alreadyMappedIds.Contains(rfqId))
            {
                aob.AOBRFQMappings.Add(new AOBRFQMapping
                {
                    AOBId = aob.Id,
                    RFQId = rfqId
                });
            }
        }

        aob.UpdatedAt = DateTime.UtcNow;
        aob.UpdatedBy = "System";

        unitOfWork.AOBRepository.Update(aob);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "RFQs successfully linked to AOB.");
    }
}
