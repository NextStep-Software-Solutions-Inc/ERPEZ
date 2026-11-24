using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.UpdateAOB;

public class UpdateAOBCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateAOBCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateAOBCommand request, CancellationToken cancellationToken)
    {
        var aob = await unitOfWork.AOBRepository.Query()
            .Include(a => a.AOBRFQMappings)
            .FirstOrDefaultAsync(a => a.Id == request.Id && !a.IsDeleted, cancellationToken);

        if (aob == null)
        {
            return ApiResponse<Unit>.Fail("Abstract of Bids (AOB) not found.");
        }

        // Modifications allowed only in Draft or Returned
        if (aob.Status != StatusEnum.Draft && aob.Status != StatusEnum.Returned)
        {
            return ApiResponse<Unit>.Fail($"AOB in status '{aob.Status}' cannot be modified. Only Draft or Returned AOBs can be updated.");
        }

        var rfqIds = request.RFQIds ?? [];

        if (rfqIds.Count > 0)
        {
            var existingRfqIds = await unitOfWork.RFQRepository.Query()
                .Where(r => rfqIds.Contains(r.Id))
                .Select(r => r.Id)
                .ToListAsync(cancellationToken);

            var missingIds = rfqIds.Except(existingRfqIds).ToList();
            if (missingIds.Count > 0)
            {
                return ApiResponse<Unit>.Fail($"The following RFQ ID(s) do not exist: {string.Join(", ", missingIds)}");
            }
        }

        aob.AOBNumber = request.AOBNumber;
        aob.Description = request.Description;
        aob.AwardCriterion = request.AwardCriterion;
        aob.AOBDate = request.AOBDate;
        aob.OpeningDate = DateTime.SpecifyKind(request.OpeningDate, DateTimeKind.Utc);
        aob.Remarks = request.Remarks;
        aob.UpdatedAt = DateTime.UtcNow;
        aob.UpdatedBy = "System";

        // Sync RFQ mappings
        // 1. Remove mappings that are no longer in request
        var mappingsToRemove = aob.AOBRFQMappings
            .Where(m => !rfqIds.Contains(m.RFQId))
            .ToList();

        foreach (var mapping in mappingsToRemove)
        {
            aob.AOBRFQMappings.Remove(mapping);
            unitOfWork.AOBRFQMappingRepository.Remove(mapping, hardDelete: true);
        }

        // 2. Add new mappings
        var existingMappedRfqIds = aob.AOBRFQMappings
            .Select(m => m.RFQId)
            .ToList();

        var rfqIdsToAdd = rfqIds
            .Except(existingMappedRfqIds)
            .ToList();

        foreach (var rfqId in rfqIdsToAdd)
        {
            aob.AOBRFQMappings.Add(new AOBRFQMapping
            {
                AOBId = aob.Id,
                RFQId = rfqId
            });
        }

        unitOfWork.AOBRepository.Update(aob);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Abstract of Bids (AOB) updated successfully.");
    }
}
