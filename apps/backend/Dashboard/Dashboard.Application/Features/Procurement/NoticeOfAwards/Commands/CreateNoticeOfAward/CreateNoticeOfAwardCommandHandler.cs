using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.CreateNoticeOfAward;

public class CreateNoticeOfAwardCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateNoticeOfAwardCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateNoticeOfAwardCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        var bacRes = await unitOfWork.BACResolutionRepository.FindAsync(r => r.Id == request.BacResolutionId, cancellationToken);
        if (bacRes == null)
        {
            return ApiResponse<Guid>.Fail("Selected BAC Resolution not found.");
        }

        var existingNoa = await unitOfWork.NoticeOfAwardRepository.FindAsync(
            n => n.BACResolutionId == request.BacResolutionId && !n.IsDeleted,
            cancellationToken
        );
        if (existingNoa != null)
        {
            return ApiResponse<Guid>.Fail($"A Notice of Award ({existingNoa.NOANumber}) is already active for this BAC Resolution.");
        }

        var project = await unitOfWork.ProcurementProjectRepository.FindAsync(p => p.Id == bacRes.ProcurementProjectId, cancellationToken);
        if (project == null)
        {
            return ApiResponse<Guid>.Fail("Procurement Project linked to the BAC Resolution was not found.");
        }

        if (project.ProcurementModeId.HasValue)
        {
            var mode = await unitOfWork.ProcurementModeRepository.FindAsync(m => m.Id == project.ProcurementModeId.Value, cancellationToken);
            if (mode != null)
            {
                var name = mode.Name.ToLowerInvariant();
                var isPublicBidding = name.Contains("public bidding") || name.Contains("competitive") || (name.Contains("bidding") && !name.Contains("small value"));
                if (!isPublicBidding)
                {
                    return ApiResponse<Guid>.Fail($"Notice of Award can only be created for Public Bidding / Competitive Bidding projects. Mode '{mode.Name}' is not eligible.");
                }
            }
        }

        var aobMapping = await unitOfWork.AOBProcurementProjectMappingRepository.FindAsync(m => m.ProcurementProjectId == project.Id, cancellationToken);
        var aob = aobMapping != null ? await unitOfWork.AOBRepository.FindAsync(a => a.Id == aobMapping.AOBId, cancellationToken) : null;
        var aobAwardedItem = aob != null ? await unitOfWork.AOBAwardedItemRepository.FindAsync(ai => ai.AOBId == aob.Id, cancellationToken) : null;

        var supplierId = aobAwardedItem?.WinningSupplierId ?? Guid.Empty;
        if (supplierId == Guid.Empty)
        {
            var fallbackSupplier = (await unitOfWork.SupplierRepository.ToListAsync(unitOfWork.SupplierRepository.Query(), cancellationToken)).FirstOrDefault();
            if (fallbackSupplier != null) supplierId = fallbackSupplier.Id;
        }

        var awardedAmount = aobAwardedItem?.TotalAwardedAmount ?? project.ABC;
        var awardCriterion = aob?.AwardCriterion.ToString() ?? "LCRB";

        var currentYear = DateTime.UtcNow.Year;
        var yearNoas = await unitOfWork.NoticeOfAwardRepository.ToListAsync(
            unitOfWork.NoticeOfAwardRepository.Query(n => n.CreatedAt.Year == currentYear),
            cancellationToken
        );
        var sequence = yearNoas.Count + 1;
        var noaNumber = $"NOA-{currentYear}-{sequence:D3}";

        var noa = new NoticeOfAward
        {
            Id = Guid.NewGuid(),
            NOANumber = noaNumber,
            BACResolutionId = bacRes.Id,
            ProcurementProjectId = project.Id,
            SupplierId = supplierId,
            NOADate = request.Date != default ? request.Date : DateOnly.FromDateTime(DateTime.UtcNow),
            BidDate = request.DateBid != default ? request.DateBid : DateOnly.FromDateTime(DateTime.UtcNow),
            Description = request.Description,
            ProcurementType = request.Type,
            AwardedAmount = awardedAmount,
            AwardCriterion = awardCriterion,
            Status = NoticeOfAwardStatus.Draft,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = command.ActorName,
            UpdatedAt = DateTime.UtcNow,
            UpdatedBy = command.ActorName
        };

        var activity = new NoticeOfAwardActivity
        {
            Id = Guid.NewGuid(),
            NoticeOfAwardId = noa.Id,
            Action = "Created Draft",
            ActorId = command.ActorId,
            ActorName = command.ActorName,
            Timestamp = DateTime.UtcNow,
            Notes = $"Draft Notice of Award {noaNumber} created.",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = command.ActorName
        };

        await unitOfWork.NoticeOfAwardRepository.AddAsync(noa, cancellationToken);
        await unitOfWork.NoticeOfAwardActivityRepository.AddAsync(activity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(noa.Id, "Notice of Award draft created successfully.");
    }
}
