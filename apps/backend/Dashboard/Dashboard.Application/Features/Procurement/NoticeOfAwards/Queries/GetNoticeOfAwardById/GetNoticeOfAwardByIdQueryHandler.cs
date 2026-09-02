using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Dtos;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Utils;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Queries.GetNoticeOfAwardById;

public class GetNoticeOfAwardByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetNoticeOfAwardByIdQuery, ApiResponse<NoticeOfAwardDetailDto>>
{
    public async Task<ApiResponse<NoticeOfAwardDetailDto>> Handle(GetNoticeOfAwardByIdQuery request, CancellationToken cancellationToken)
    {
        var noa = await unitOfWork.NoticeOfAwardRepository.FindAsync(n => n.Id == request.Id, cancellationToken);
        if (noa == null)
        {
            return ApiResponse<NoticeOfAwardDetailDto>.Fail("Notice of Award not found.");
        }

        var bacRes = await unitOfWork.BACResolutionRepository.FindAsync(r => r.Id == noa.BACResolutionId, cancellationToken);
        var project = await unitOfWork.ProcurementProjectRepository.FindAsync(p => p.Id == noa.ProcurementProjectId, cancellationToken);
        var supplier = await unitOfWork.SupplierRepository.FindAsync(s => s.Id == noa.SupplierId, cancellationToken);

        var milestones = await unitOfWork.NoticeOfAwardMilestoneRepository.ToListAsync(
            unitOfWork.NoticeOfAwardMilestoneRepository.Query(m => m.NoticeOfAwardId == noa.Id),
            cancellationToken
        );

        var activities = await unitOfWork.NoticeOfAwardActivityRepository.ToListAsync(
            unitOfWork.NoticeOfAwardActivityRepository.Query(a => a.NoticeOfAwardId == noa.Id),
            cancellationToken
        );

        var cpr = project?.ConsolidatedPRId.HasValue == true
            ? await unitOfWork.ConsolidatedPRRepository.FindAsync(c => c.Id == project.ConsolidatedPRId.Value, cancellationToken)
            : null;

        var cprItems = project?.ConsolidatedPRId.HasValue == true
            ? await unitOfWork.ConsolidatedPRItemRepository.ToListAsync(
                unitOfWork.ConsolidatedPRItemRepository.Query(ci => ci.ConsolidatedPRId == project.ConsolidatedPRId.Value),
                cancellationToken
            )
            : [];

        var prItemIds = cprItems.Select(ci => ci.PRItemId).Distinct().ToList();
        var prItems = await unitOfWork.PRItemRepository.ToListAsync(
            unitOfWork.PRItemRepository.Query(pi => prItemIds.Contains(pi.Id)),
            cancellationToken
        );

        var lineItems = cprItems.Select(ci =>
        {
            var pi = prItems.FirstOrDefault(p => p.Id == ci.PRItemId);
            return new AwardedLineItemDto
            {
                Id = ci.Id.ToString(),
                ItemName = pi?.Name ?? "Procurement Item",
                Category = "Goods & Services",
                Description = pi?.Description ?? string.Empty,
                Quantity = pi?.RequestedQuantity ?? 1,
                Unit = "lot",
                UnitPrice = pi?.UnitCost ?? 0,
                Amount = pi?.Amount ?? 0
            };
        }).ToList();

        var conformeMilestone = milestones.FirstOrDefault(m => m.MilestoneType == NoticeOfAwardMilestoneType.ConformeReceived);
        var securityMilestone = milestones.FirstOrDefault(m => m.MilestoneType == NoticeOfAwardMilestoneType.PerformanceSecurityPosted);
        var contractMilestone = milestones.FirstOrDefault(m => m.MilestoneType == NoticeOfAwardMilestoneType.ContractExecuted);

        var aobMapping = await unitOfWork.AOBProcurementProjectMappingRepository.FindAsync(m => m.ProcurementProjectId == noa.ProcurementProjectId, cancellationToken);
        var aob = aobMapping != null ? await unitOfWork.AOBRepository.FindAsync(a => a.Id == aobMapping.AOBId, cancellationToken) : null;

        var slaState = NoticeOfAwardSlaCalculator.CalculateSla(noa, milestones);

        var dto = new NoticeOfAwardDetailDto
        {
            Id = noa.Id,
            NOANumber = noa.NOANumber,
            Date = noa.NOADate,
            DateBid = noa.BidDate,
            Description = noa.Description,
            Type = noa.ProcurementType,
            Status = noa.Status,
            TotalAmount = noa.AwardedAmount,
            SupplierId = noa.SupplierId,
            SupplierName = supplier?.Name ?? string.Empty,
            AwardCriterion = noa.AwardCriterion,
            AwardedAmount = noa.AwardedAmount,

            BACResolutionId = noa.BACResolutionId,
            BACResolutionNumber = bacRes?.ResolutionNumber ?? string.Empty,
            BACResolutionDate = bacRes != null ? DateOnly.FromDateTime(bacRes.DateResolved) : DateOnly.MinValue,
            BACResolutionDescription = bacRes?.WhereasClause ?? string.Empty,
            SourceAOBNumber = aob?.AOBNumber,

            ProcurementProjectId = noa.ProcurementProjectId,
            ProjectName = project?.Title ?? string.Empty,
            ProjectDescription = project?.ScopeOfWork ?? string.Empty,
            PRNumber = cpr?.CPRNumber ?? string.Empty,
            EndUser = project?.EndUserRepresentative != null ? $"{project.EndUserRepresentative.FirstName} {project.EndUserRepresentative.LastName}" : "Procurement Office",
            ModeOfProcurement = project?.ProcurementMode?.Name ?? "Public Bidding",
            ApprovedBudget = project?.ABC ?? 0,

            ApprovedById = noa.ApprovedById,
            ApprovedByName = noa.ApprovedByName,
            ApprovedAt = noa.ApprovedAt,
            IssuedAt = noa.IssuedAt,
            ReceivedAt = noa.ReceivedAt,
            SignedDocumentFileId = noa.SignedDocumentFileId,
            SignedDocumentFileName = noa.SignedDocumentFileName,
            PhilGEPSPostedAt = noa.PhilGEPSPostedAt,
            PhilGEPSReferenceNumber = noa.PhilGEPSReferenceNumber,
            ReturnReason = noa.ReturnReason,

            ContractExecutionDeadline = noa.ContractExecutionDeadline,
            ContractExecutionJustification = noa.ContractExecutionJustification,
            JustificationLoggedAt = noa.JustificationLoggedAt,
            CascadeTriggeredAt = noa.CascadeTriggeredAt,
            CascadeTriggeredByName = noa.CascadeTriggeredByName,
            CascadeNote = noa.CascadeNote,
            SlaState = slaState,

            LineItems = lineItems,
            Milestones = milestones.OrderBy(m => m.CreatedAt).Select(m => new NoticeOfAwardMilestoneDto
            {
                Id = m.Id,
                NoticeOfAwardId = m.NoticeOfAwardId,
                MilestoneType = m.MilestoneType,
                MilestoneKey = m.MilestoneType.ToString(),
                DateLogged = m.DateLogged,
                FileId = m.FileId,
                FileName = m.FileName,
                Remarks = m.Remarks,
                LoggedByName = m.LoggedByName
            }).ToList(),
            ActivityLog = activities.OrderByDescending(a => a.Timestamp).Select(a => new NoticeOfAwardActivityDto
            {
                Id = a.Id,
                Action = a.Action,
                Actor = a.ActorName,
                Timestamp = a.Timestamp,
                Note = a.Notes
            }).ToList(),

            ConformeReceivedDate = conformeMilestone?.DateLogged,
            ConformeFileName = conformeMilestone?.FileName,
            ConformeFileId = conformeMilestone?.FileId,
            PerformanceSecurityPostedDate = securityMilestone?.DateLogged,
            PerformanceSecurityFileName = securityMilestone?.FileName,
            PerformanceSecurityFileId = securityMilestone?.FileId,
            ContractExecutionDate = contractMilestone?.DateLogged,
            ContractFileName = contractMilestone?.FileName,
            ContractFileId = contractMilestone?.FileId,

            CreatedAt = noa.CreatedAt,
            UpdatedAt = noa.UpdatedAt
        };

        return ApiResponse<NoticeOfAwardDetailDto>.Success(dto);
    }
}
