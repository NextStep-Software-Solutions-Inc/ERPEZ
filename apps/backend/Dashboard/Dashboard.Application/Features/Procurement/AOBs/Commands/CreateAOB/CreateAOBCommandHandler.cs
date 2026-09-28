using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
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
            .FindAsync(a => a.AOBNumber == request.AOBNumber, cancellationToken) != null;
        if (existingAOB)
        {
            return ApiResponse<Guid>.Fail($"An Abstract of Bids (AOB) with number '{request.AOBNumber}' already exists.");
        }

        if (request.RFQIds != null && request.RFQIds.Count > 0)
        {
            var existingApprovedRfqIds = await unitOfWork.RFQRepository.Query()
                .Where(r => request.RFQIds.Contains(r.Id) && r.Status == StatusEnum.Approved)
                .Select(r => r.Id)
                .ToListAsync(cancellationToken);

            var invalidOrUnapprovedIds = request.RFQIds.Except(existingApprovedRfqIds).ToList();
            if (invalidOrUnapprovedIds.Count > 0)
            {
                return ApiResponse<Guid>.Fail($"Only approved RFQs can be linked to an AOB. The following RFQ ID(s) do not exist or are not approved: {string.Join(", ", invalidOrUnapprovedIds)}");
            }
        }

        var aob = new AOB
        {
            AOBNumber = request.AOBNumber,
            Description = request.Description,
            AwardCriterion = request.AwardCriterion,
            AOBDate = request.AOBDate,
            OpeningDate = DateTime.SpecifyKind(request.OpeningDate, DateTimeKind.Utc),
            Status = StatusEnum.Draft,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "System"
        };

        if (request.RFQIds != null)
        {
            foreach (var rfqId in request.RFQIds)
            {
                aob.AOBRFQMappings.Add(new AOBRFQMapping
                {
                    RFQId = rfqId
                });
            }
        }

        await unitOfWork.AOBRepository.AddAsync(aob, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(aob.Id, "Abstract of Bids (AOB) created successfully.");
    }
}
