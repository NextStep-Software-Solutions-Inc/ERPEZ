using System;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Utils;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.ApproveNoticeOfAward;

public class ApproveNoticeOfAwardCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<ApproveNoticeOfAwardCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(ApproveNoticeOfAwardCommand command, CancellationToken cancellationToken)
    {
        var noa = await unitOfWork.NoticeOfAwardRepository.FindAsync(n => n.Id == command.Id, cancellationToken);
        if (noa == null)
        {
            return ApiResponse<Unit>.Fail("Notice of Award not found.");
        }

        if (noa.Status != NoticeOfAwardStatus.ForApproval)
        {
            return ApiResponse<Unit>.Fail($"Notice of Award in status '{noa.Status}' cannot be approved. Must be 'ForApproval'.");
        }

        var req = command.Request;

        // Authoritative freeze of awarded details at issuance (Option B)
        var project = await unitOfWork.ProcurementProjectRepository.FindAsync(p => p.Id == noa.ProcurementProjectId, cancellationToken);
        var aobMapping = project != null ? await unitOfWork.AOBProcurementProjectMappingRepository.FindAsync(m => m.ProcurementProjectId == project.Id, cancellationToken) : null;
        var aob = aobMapping != null ? await unitOfWork.AOBRepository.FindAsync(a => a.Id == aobMapping.AOBId, cancellationToken) : null;
        var aobAwardedItem = aob != null ? await unitOfWork.AOBAwardedItemRepository.FindAsync(ai => ai.AOBId == aob.Id, cancellationToken) : null;

        if (aobAwardedItem != null)
        {
            noa.SupplierId = aobAwardedItem.WinningSupplierId;
            noa.AwardedAmount = aobAwardedItem.TotalAwardedAmount;
            noa.AwardCriterion = aob?.AwardCriterion.ToString() ?? "LCRB";
        }

        var now = DateTime.UtcNow;
        var phDate = NoticeOfAwardSlaCalculator.ToPhilippineDate(now);

        noa.Status = NoticeOfAwardStatus.Approved;
        noa.ApprovedById = command.ActorId;
        noa.ApprovedByName = command.ActorName;
        noa.ApprovedAt = now;
        noa.IssuedAt = now;
        noa.ReceivedAt = null;
        noa.SignedDocumentFileId = req.SignedDocumentFileId;
        noa.SignedDocumentFileName = req.SignedDocumentFileName;
        noa.PhilGEPSPostedAt = req.PhilGEPSPostedAt;
        noa.PhilGEPSReferenceNumber = req.PhilGEPSReferenceNumber;
        noa.ContractExecutionDeadline = null;
        noa.UpdatedAt = now;
        noa.UpdatedBy = command.ActorName;

        var activity = new NoticeOfAwardActivity
        {
            Id = Guid.NewGuid(),
            NoticeOfAwardId = noa.Id,
            Action = "Approved & Issued by HoPE",
            ActorId = command.ActorId,
            ActorName = command.ActorName,
            Timestamp = now,
            Notes = req.Remarks ?? "Notice of Award approved and issued to winning bidder. 10-day contract execution SLA commenced.",
            CreatedAt = now,
            CreatedBy = command.ActorName
        };

        unitOfWork.NoticeOfAwardRepository.Update(noa);
        await unitOfWork.NoticeOfAwardActivityRepository.AddAsync(activity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Notice of Award approved and issued successfully.");
    }
}
