using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.Dashboard.Dtos;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.Dashboard.Queries.GetDashboardBottleneck;

public class GetDashboardBottleneckQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetDashboardBottleneckQuery, ApiResponse<ProcurementBottleneckDto>>
{
    public async Task<ApiResponse<ProcurementBottleneckDto>> Handle(
        GetDashboardBottleneckQuery query, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var today = DateOnly.FromDateTime(now);
        var targetYear = query.FiscalYear;

        var allStalledItems = new List<StalledItemDto>();
        var stages = new List<StageBottleneck>();

        // 1. PR -> CPR creation (stalled > 7d)
        var prBase = unitOfWork.PurchaseRequestRepository.Query(pr => !pr.IsDeleted && pr.CreatedAt.Year == targetYear);
        if (query.OfficeId.HasValue && query.OfficeId.Value != Guid.Empty)
        {
            prBase = prBase.Where(pr => pr.OfficeId == query.OfficeId.Value);
        }

        var consolidatedPRItemPrIds = await unitOfWork.ConsolidatedPRItemRepository.Query(c => !c.IsDeleted)
            .Select(c => c.PRItem.PurchaseRequestId)
            .Distinct()
            .ToListAsync(cancellationToken);
        var consolidatedSet = new HashSet<Guid>(consolidatedPRItemPrIds);

        var prs = await prBase
            .Include(p => p.Office)
            .Where(p => p.Status == StatusEnum.Submitted)
            .ToListAsync(cancellationToken);

        var stalledPRs = prs
            .Where(p => !consolidatedSet.Contains(p.Id) && (now - p.CreatedAt).TotalDays > 7)
            .ToList();

        var stage1Avg = stalledPRs.Count > 0 ? stalledPRs.Average(p => (now - p.CreatedAt).TotalDays) : 0;
        stages.Add(new StageBottleneck
        {
            Stage = "PR → CPR creation",
            StalledCount = stalledPRs.Count,
            AvgStalledDays = Math.Round(stage1Avg, 1),
            ThresholdDays = 7,
            IsWorstBottleneck = false
        });

        foreach (var pr in stalledPRs.Take(5))
        {
            allStalledItems.Add(new StalledItemDto
            {
                DocumentNo = pr.PRNumber,
                Description = pr.Purpose ?? pr.Description ?? "Purchase Request",
                OfficeName = pr.Office?.Name ?? "Office",
                AgeDays = (int)(now - pr.CreatedAt).TotalDays,
                Stage = "PR → CPR creation"
            });
        }

        // 2. CPR -> RFQ issuance (stalled > 5d)
        var cprs = await unitOfWork.ConsolidatedPRRepository.Query(c => !c.IsDeleted && c.CreatedAt.Year == targetYear)
            .Include(c => c.RFQs)
            .ToListAsync(cancellationToken);
        var stalledCprs = cprs.Where(c => c.RFQs.Count == 0 && (now - c.CreatedAt).TotalDays > 5).ToList();
        var stage2Avg = stalledCprs.Count > 0 ? stalledCprs.Average(c => (now - c.CreatedAt).TotalDays) : 0;
        stages.Add(new StageBottleneck
        {
            Stage = "CPR → RFQ issuance",
            StalledCount = stalledCprs.Count,
            AvgStalledDays = Math.Round(stage2Avg, 1),
            ThresholdDays = 5,
            IsWorstBottleneck = false
        });

        foreach (var cpr in stalledCprs.Take(5))
        {
            allStalledItems.Add(new StalledItemDto
            {
                DocumentNo = cpr.CPRNumber,
                Description = cpr.Description ?? cpr.Purpose ?? "Consolidated PR",
                OfficeName = "Procurement Office",
                AgeDays = (int)(now - cpr.CreatedAt).TotalDays,
                Stage = "CPR → RFQ issuance"
            });
        }

        // 3. RFQ -> AOB completion (stalled > 3d post-closing)
        var rfqs = await unitOfWork.RFQRepository.Query(r => !r.IsDeleted && r.CreatedAt.Year == targetYear)
            .Where(r => r.Deadline.HasValue && r.Deadline.Value < today && r.Status != StatusEnum.Approved)
            .ToListAsync(cancellationToken);
        var stalledRfqs = rfqs.Where(r => (today.DayNumber - r.Deadline!.Value.DayNumber) > 3).ToList();
        var stage3Avg = stalledRfqs.Count > 0 ? stalledRfqs.Average(r => (today.DayNumber - r.Deadline!.Value.DayNumber)) : 0;
        stages.Add(new StageBottleneck
        {
            Stage = "RFQ → AOB completion",
            StalledCount = stalledRfqs.Count,
            AvgStalledDays = Math.Round(stage3Avg, 1),
            ThresholdDays = 3,
            IsWorstBottleneck = false
        });

        foreach (var rfq in stalledRfqs.Take(5))
        {
            allStalledItems.Add(new StalledItemDto
            {
                DocumentNo = rfq.RFQNumber,
                Description = rfq.Description ?? rfq.Purpose ?? "Request for Quotation",
                OfficeName = "BAC Secretariat",
                AgeDays = today.DayNumber - rfq.Deadline!.Value.DayNumber,
                Stage = "RFQ → AOB completion"
            });
        }

        // 4. AOB -> BAC Resolution (stalled > 5d)
        var aobs = await unitOfWork.AOBRepository.Query(a => !a.IsDeleted && a.CreatedAt.Year == targetYear)
            .Where(a => a.Status == StatusEnum.Approved && (now - a.CreatedAt).TotalDays > 5)
            .ToListAsync(cancellationToken);
        stages.Add(new StageBottleneck
        {
            Stage = "AOB → BAC Resolution",
            StalledCount = aobs.Count,
            AvgStalledDays = aobs.Count > 0 ? Math.Round(aobs.Average(a => (now - a.CreatedAt).TotalDays), 1) : 0,
            ThresholdDays = 5,
            IsWorstBottleneck = false
        });

        // 5. BAC Res. -> NOA (stalled > 5d)
        var noaProjectIds = await unitOfWork.NoticeOfAwardRepository.Query(n => !n.IsDeleted)
            .Select(n => n.ProcurementProjectId)
            .ToListAsync(cancellationToken);
        var noaProjectSet = new HashSet<Guid>(noaProjectIds);

        var bacRes = await unitOfWork.BACResolutionRepository.Query(b => !b.IsDeleted && b.CreatedAt.Year == targetYear)
            .Include(b => b.ProcurementProject)
            .Where(b => b.Status == "Approved" && (now - b.CreatedAt).TotalDays > 5)
            .ToListAsync(cancellationToken);
        var stalledBacRes = bacRes.Where(b => !noaProjectSet.Contains(b.ProcurementProjectId)).ToList();
        stages.Add(new StageBottleneck
        {
            Stage = "BAC Res. → NOA",
            StalledCount = stalledBacRes.Count,
            AvgStalledDays = stalledBacRes.Count > 0 ? Math.Round(stalledBacRes.Average(b => (now - b.CreatedAt).TotalDays), 1) : 0,
            ThresholdDays = 5,
            IsWorstBottleneck = false
        });

        // 6. NOA -> Contract execution (stalled > 10d)
        var contractNoaIds = await unitOfWork.ContractRepository.Query(c => !c.IsDeleted)
            .Select(c => c.NoticeOfAwardId)
            .ToListAsync(cancellationToken);
        var contractNoaSet = new HashSet<Guid>(contractNoaIds);

        var noas = await unitOfWork.NoticeOfAwardRepository.Query(n => !n.IsDeleted && n.CreatedAt.Year == targetYear)
            .Include(n => n.Supplier)
            .Where(n => n.Status == NoticeOfAwardStatus.Approved && (now - n.CreatedAt).TotalDays > 10)
            .ToListAsync(cancellationToken);
        var stalledNoas = noas.Where(n => !contractNoaSet.Contains(n.Id)).ToList();
        stages.Add(new StageBottleneck
        {
            Stage = "NOA → Contract execution",
            StalledCount = stalledNoas.Count,
            AvgStalledDays = stalledNoas.Count > 0 ? Math.Round(stalledNoas.Average(n => (now - n.CreatedAt).TotalDays), 1) : 0,
            ThresholdDays = 10,
            IsWorstBottleneck = false
        });

        foreach (var noa in stalledNoas.Take(5))
        {
            allStalledItems.Add(new StalledItemDto
            {
                DocumentNo = noa.NOANumber,
                Description = noa.Description ?? "Notice of Award",
                OfficeName = noa.Supplier?.Name ?? "Supplier",
                AgeDays = (int)(now - noa.CreatedAt).TotalDays,
                Stage = "NOA → Contract execution"
            });
        }

        // 7. Contract -> NTP issuance (stalled > 3d)
        var ntpContractIds = await unitOfWork.NoticeToProceedRepository.Query(n => !n.IsDeleted)
            .Select(n => n.ContractId)
            .ToListAsync(cancellationToken);
        var ntpContractSet = new HashSet<Guid>(ntpContractIds);

        var contracts = await unitOfWork.ContractRepository.Query(c => !c.IsDeleted && c.CreatedAt.Year == targetYear)
            .Where(c => (c.Status == ContractStatus.Approved || c.Status == ContractStatus.Executed) && (now - c.CreatedAt).TotalDays > 3)
            .ToListAsync(cancellationToken);
        var stalledContracts = contracts.Where(c => !ntpContractSet.Contains(c.Id)).ToList();
        stages.Add(new StageBottleneck
        {
            Stage = "Contract → NTP issuance",
            StalledCount = stalledContracts.Count,
            AvgStalledDays = stalledContracts.Count > 0 ? Math.Round(stalledContracts.Average(c => (now - c.CreatedAt).TotalDays), 1) : 0,
            ThresholdDays = 3,
            IsWorstBottleneck = false
        });

        foreach (var contract in stalledContracts.Take(5))
        {
            allStalledItems.Add(new StalledItemDto
            {
                DocumentNo = contract.ContractNumber,
                Description = contract.Description ?? "Contract Agreement",
                OfficeName = "Procurement Office",
                AgeDays = (int)(now - contract.CreatedAt).TotalDays,
                Stage = "Contract → NTP issuance"
            });
        }

        // Determine worst bottleneck
        var maxStalled = stages.Max(s => s.StalledCount);
        if (maxStalled > 0)
        {
            var worst = stages.First(s => s.StalledCount == maxStalled);
            stages = stages.Select(s => s == worst ? s with { IsWorstBottleneck = true } : s).ToList();
        }

        var topStalled = allStalledItems.OrderByDescending(i => i.AgeDays).Take(5).ToList();

        var result = new ProcurementBottleneckDto
        {
            Stages = stages,
            TopStalledItems = topStalled
        };

        return ApiResponse<ProcurementBottleneckDto>.Success(result);
    }
}
