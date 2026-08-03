using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.CreateAOB;

public class CreateAOBCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateAOBCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateAOBCommand request, CancellationToken cancellationToken)
    {
        var existingAOB = await unitOfWork.AOBRepository
            .Query(a => a.AOBNumber == request.AOBNumber && !a.IsDeleted)
            .AnyAsync(cancellationToken);
        if (existingAOB)
        {
            return ApiResponse<Guid>.Fail($"An Abstract of Bids (AOB) with number '{request.AOBNumber}' already exists.");
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
                return ApiResponse<Guid>.Fail($"The following Procurement Project ID(s) do not exist: {string.Join(", ", missingIds)}");
            }
        }

        var aob = new AOB
        {
            AOBNumber = request.AOBNumber,
            Description = request.Description,
            AwardCriterion = request.AwardCriterion,
            AOBDate = request.AOBDate,
            OpeningDate = request.OpeningDate,
            Status = "DRAFT"
        };

        if (request.ProcurementProjectIds != null)
        {
            foreach (var projectId in request.ProcurementProjectIds)
            {
                aob.AOBProcurementProjectMappings.Add(new AOBProcurementProjectMapping
                {
                    ProcurementProjectId = projectId
                });
            }
        }

        await unitOfWork.AOBRepository.AddAsync(aob, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(aob.Id, "Abstract of Bids (AOB) created successfully.");
    }
}
