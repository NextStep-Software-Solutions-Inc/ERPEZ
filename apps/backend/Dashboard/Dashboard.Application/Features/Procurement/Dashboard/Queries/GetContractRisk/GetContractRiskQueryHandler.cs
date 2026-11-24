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

namespace ERPEZ.Application.Features.Procurement.Dashboard.Queries.GetContractRisk;

public class GetContractRiskQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetContractRiskQuery, ApiResponse<ProcurementContractRiskDto>>
{
    public async Task<ApiResponse<ProcurementContractRiskDto>> Handle(
        GetContractRiskQuery query, CancellationToken cancellationToken)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var ninetyDaysAhead = today.AddDays(90);

        // Fetch active/executed contracts with their NOA and Supplier
        var contracts = await unitOfWork.ContractRepository.Query(c => !c.IsDeleted && c.Status != ContractStatus.Cancelled)
            .Include(c => c.NoticeOfAward)
                .ThenInclude(n => n.Supplier)
            .Include(c => c.NoticeOfAward)
                .ThenInclude(n => n.ProcurementProject)
            .ToListAsync(cancellationToken);

        // Fetch NTPs to get delivery/completion deadlines
        var contractIds = contracts.Select(c => c.Id).ToList();
        var ntps = await unitOfWork.NoticeToProceedRepository.Query(n => !n.IsDeleted && contractIds.Contains(n.ContractId))
            .ToListAsync(cancellationToken);

        var ntpByContract = ntps
            .GroupBy(n => n.ContractId)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(n => n.CreatedAt).First());

        var expiringList = new List<ExpiringContractDto>();

        foreach (var c in contracts)
        {
            DateOnly? endDate = null;
            if (ntpByContract.TryGetValue(c.Id, out var ntp) && ntp.DeliveryCompletionDeadline.HasValue)
            {
                endDate = ntp.DeliveryCompletionDeadline.Value;
            }
            else if (c.NoticeOfAward?.ProcurementProject?.DeliveryPeriodDays.HasValue == true && c.ContractApprovedAt.HasValue)
            {
                endDate = c.ContractApprovedAt.Value.AddDays(c.NoticeOfAward.ProcurementProject.DeliveryPeriodDays.Value);
            }
            else if (c.ContractDate != default)
            {
                endDate = c.ContractDate.AddDays(180); // Default 6-month contract horizon if unspecified
            }

            if (endDate.HasValue)
            {
                var daysUntilExpiry = endDate.Value.DayNumber - today.DayNumber;
                // Expiration window: up to 90 days ahead (including already expired up to -30 days)
                if (daysUntilExpiry <= 90 && daysUntilExpiry >= -30)
                {
                    expiringList.Add(new ExpiringContractDto
                    {
                        Id = c.Id,
                        ContractNumber = c.ContractNumber,
                        Title = c.Description ?? c.NoticeOfAward?.ProcurementProject?.Title ?? "Contract Agreement",
                        SupplierName = c.NoticeOfAward?.Supplier?.Name ?? "Supplier",
                        EndDate = endDate,
                        TotalAmount = c.NoticeOfAward?.AwardedAmount ?? 0,
                        Status = c.Status.ToString(),
                        DaysUntilExpiry = daysUntilExpiry
                    });
                }
            }
        }

        var sortedExpiring = expiringList.OrderBy(e => e.DaysUntilExpiry).ToList();

        var value30 = sortedExpiring.Where(e => e.DaysUntilExpiry <= 30).Sum(e => e.TotalAmount);
        var value60 = sortedExpiring.Where(e => e.DaysUntilExpiry > 30 && e.DaysUntilExpiry <= 60).Sum(e => e.TotalAmount);
        var value90 = sortedExpiring.Where(e => e.DaysUntilExpiry > 60 && e.DaysUntilExpiry <= 90).Sum(e => e.TotalAmount);

        var response = new ProcurementContractRiskDto
        {
            TotalValueAtRisk30Days = value30,
            TotalValueAtRisk60Days = value60,
            TotalValueAtRisk90Days = value90,
            ExpiringContracts = sortedExpiring
        };

        return ApiResponse<ProcurementContractRiskDto>.Success(response);
    }
}
