using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.Dashboard.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.Dashboard.Queries.GetSupplierPerformanceDetail;

public class GetSupplierPerformanceDetailQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetSupplierPerformanceDetailQuery, ApiResponse<SupplierPerformanceDetailDto>>
{
    public async Task<ApiResponse<SupplierPerformanceDetailDto>> Handle(
        GetSupplierPerformanceDetailQuery query, CancellationToken cancellationToken)
    {
        var supplier = await unitOfWork.SupplierRepository.Query(s => s.Id == query.SupplierId)
            .FirstOrDefaultAsync(cancellationToken);

        if (supplier == null)
        {
            return ApiResponse<SupplierPerformanceDetailDto>.Fail("Supplier not found.");
        }

        // Fetch contracts for this supplier via NoticeOfAward
        var contracts = await unitOfWork.ContractRepository.Query(c => !c.IsDeleted && c.NoticeOfAward.SupplierId == query.SupplierId)
            .Include(c => c.NoticeOfAward)
            .OrderByDescending(c => c.CreatedAt)
            .Take(10)
            .ToListAsync(cancellationToken);

        // Fetch NOAs for awarded volume
        var noas = await unitOfWork.NoticeOfAwardRepository.Query(n => !n.IsDeleted && n.SupplierId == query.SupplierId)
            .ToListAsync(cancellationToken);

        var totalAwardedAmount = noas.Count > 0 ? noas.Sum(n => n.AwardedAmount) : contracts.Sum(c => c.NoticeOfAward != null ? c.NoticeOfAward.AwardedAmount : 0m);
        var totalContracts = Math.Max(noas.Count, contracts.Count);

        // Calculate delivery performance from contracts
        var recentDeliveries = new List<SupplierDeliveryItemDto>();
        int delayedCount = 0;
        int completedCount = 0;

        foreach (var c in contracts)
        {
            bool isDelayed = c.Status == Domain.Enums.ContractStatus.Cancelled;
            int delayDays = 0;

            if (c.ContractApprovedAt.HasValue && c.ExecutedAt.HasValue)
            {
                // If execution took > 10 statutory days from approval
                var statutoryLimit = c.ContractApprovedAt.Value.AddDays(10);
                if (c.ExecutedAt.Value > statutoryLimit)
                {
                    isDelayed = true;
                    delayDays = c.ExecutedAt.Value.DayNumber - statutoryLimit.DayNumber;
                }
            }

            if (isDelayed) delayedCount++;
            if (c.Status == Domain.Enums.ContractStatus.Executed || c.Status == Domain.Enums.ContractStatus.Approved)
            {
                completedCount++;
            }

            recentDeliveries.Add(new SupplierDeliveryItemDto
            {
                ContractId = c.Id,
                ContractNumber = c.ContractNumber,
                Title = c.Description,
                Amount = c.NoticeOfAward != null ? c.NoticeOfAward.AwardedAmount : 0m,
                Status = c.Status.ToString(),
                CompletionDate = c.UpdatedAt,
                WasDelayed = isDelayed,
                DelayDays = delayDays
            });
        }

        int totalEvaluated = contracts.Count;
        double onTimeRate = totalEvaluated > 0
            ? Math.Round(((double)(totalEvaluated - delayedCount) / totalEvaluated) * 100.0, 1)
            : 100.0;

        double qualityAcceptanceRate = totalEvaluated > 0
            ? Math.Round(((double)completedCount / totalEvaluated) * 100.0, 1)
            : 100.0;

        // RA 9184 statutory liquidated damages: 0.1% (0.001) per day of delay * awarded amount
        decimal ldAmount = recentDeliveries.Where(d => d.WasDelayed && d.DelayDays > 0)
            .Sum(d => 0.001m * d.Amount * d.DelayDays);

        var result = new SupplierPerformanceDetailDto
        {
            SupplierId = supplier.Id,
            SupplierName = supplier.Name,
            BusinessPermitNo = supplier.BusinessPermitNo,
            PhilGEPSNumber = supplier.PhilGEPSNumber,
            IsBlocked = supplier.IsBlocked,
            IsGppbBlacklisted = supplier.IsBlocked || string.Equals(supplier.Status, "Blacklisted", StringComparison.OrdinalIgnoreCase),
            OnTimeDeliveryRate = onTimeRate,
            QualityAcceptanceRate = qualityAcceptanceRate,
            TotalContractsAwarded = totalContracts,
            TotalAwardedAmount = totalAwardedAmount,
            LiquidatedDamagesIncidentsCount = delayedCount,
            TotalLiquidatedDamagesAmount = ldAmount,
            RecentDeliveries = recentDeliveries
        };

        return ApiResponse<SupplierPerformanceDetailDto>.Success(result);
    }
}
