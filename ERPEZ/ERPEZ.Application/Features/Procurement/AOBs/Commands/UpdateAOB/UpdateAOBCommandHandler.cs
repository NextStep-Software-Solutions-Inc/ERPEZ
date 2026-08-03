using ERPEZ.Domain.Entities.Procurement;
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
            .Include(a => a.AOBProcurementProjectMappings)
            .FirstOrDefaultAsync(a => a.Id == request.Id && !a.IsDeleted, cancellationToken);

        if (aob == null)
        {
            return ApiResponse<Unit>.Fail("Abstract of Bids (AOB) not found.");
        }

        if (request.ProcurementProjectIds != null && request.ProcurementProjectIds.Count > 0)
        {
            // Verify all referenced procurement projects exist
            var existingProjectIds = await unitOfWork.ProcurementProjectRepository.Query()
                .Where(p => request.ProcurementProjectIds.Contains(p.Id))
                .Select(p => p.Id)
                .ToListAsync(cancellationToken);

            var missingIds = request.ProcurementProjectIds.Except(existingProjectIds).ToList();
            if (missingIds.Count > 0)
            {
                return ApiResponse<Unit>.Fail($"The following Procurement Project ID(s) do not exist: {string.Join(", ", missingIds)}");
            }
        }

        aob.AOBNumber = request.AOBNumber;
        aob.Description = request.Description;
        aob.AwardCriterion = request.AwardCriterion;
        aob.AOBDate = request.AOBDate;
        aob.OpeningDate = DateTime.SpecifyKind(request.OpeningDate, DateTimeKind.Utc);
        aob.Status = request.Status;
        aob.UpdatedAt = DateTime.UtcNow;
        aob.UpdatedBy = "System";

        // Sync procurement project mappings
        // 1. Remove mappings that are no longer in request
        var mappingsToRemove = aob.AOBProcurementProjectMappings
            .Where(m => !request.ProcurementProjectIds.Contains(m.ProcurementProjectId))
            .ToList();

        foreach (var mapping in mappingsToRemove)
        {
            aob.AOBProcurementProjectMappings.Remove(mapping);
            unitOfWork.AOBProcurementProjectMappingRepository.Remove(mapping, hardDelete: true);
        }

        // 2. Add new mappings
        var existingMappedProjectIds = aob.AOBProcurementProjectMappings
            .Select(m => m.ProcurementProjectId)
            .ToList();

        var projectIdsToAdd = request.ProcurementProjectIds
            .Except(existingMappedProjectIds)
            .ToList();

        foreach (var projectId in projectIdsToAdd)
        {
            aob.AOBProcurementProjectMappings.Add(new AOBProcurementProjectMapping
            {
                AOBId = aob.Id,
                ProcurementProjectId = projectId
            });
        }

        unitOfWork.AOBRepository.Update(aob);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Abstract of Bids (AOB) updated successfully.");
    }
}
