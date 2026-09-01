using System;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Commands.CreateDirectAcquisition;

public class CreateDirectAcquisitionCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
    : IRequestHandler<CreateDirectAcquisitionCommand, ApiResponse<Guid>>
{
    private const decimal directAcquisitionThreshold = 200000m;

    public async Task<ApiResponse<Guid>> Handle(CreateDirectAcquisitionCommand command, CancellationToken cancellationToken)
    {
        var req = command.Request;

        // 1. Validate Consolidated PR exists
        var cpr = await unitOfWork.ConsolidatedPRRepository.GetByIdAsync(req.ConsolidatedPRId, cancellationToken);
        if (cpr == null)
        {
            return ApiResponse<Guid>.Fail("Selected Consolidated PR not found.");
        }

        // 2. Validate BAC Project if provided
        if (req.BACProjectId.HasValue && req.BACProjectId.Value != Guid.Empty)
        {
            var project = await unitOfWork.ProcurementProjectRepository.GetByIdAsync(req.BACProjectId.Value, cancellationToken);
            if (project == null)
            {
                return ApiResponse<Guid>.Fail("Selected BAC Resolution / Project not found.");
            }
        }

        // 3. Compute Total ABC derived from Consolidated PR (or selected items)
        var allCprItems = await unitOfWork.ConsolidatedPRItemRepository.Query()
            .Include(i => i.PRItem)
            .Where(i => i.ConsolidatedPRId == req.ConsolidatedPRId)
            .ToListAsync(cancellationToken);

        decimal totalAbc;
        string? remarks = null;

        if (req.SelectedItemIds != null && req.SelectedItemIds.Count > 0)
        {
            var selectedSet = req.SelectedItemIds.ToHashSet();
            var matchedItems = allCprItems.Where(i => selectedSet.Contains(i.Id) || selectedSet.Contains(i.PRItemId)).ToList();

            totalAbc = matchedItems.Sum(i => i.PRItem?.Amount ?? 0);
            if (totalAbc <= 0 && req.TotalABC.HasValue && req.TotalABC.Value > 0)
            {
                totalAbc = req.TotalABC.Value;
            }

            var savedIds = matchedItems.Select(i => i.Id).ToList();
            if (savedIds.Count > 0)
            {
                remarks = $"SELECTED_ITEMS:{string.Join(",", savedIds)}";
            }
        }
        else
        {
            totalAbc = cpr.TotalAmount > 0 ? cpr.TotalAmount : allCprItems.Sum(i => i.PRItem?.Amount ?? 0);
            if (totalAbc <= 0 && req.TotalABC.HasValue && req.TotalABC.Value > 0)
            {
                totalAbc = req.TotalABC.Value;
            }
        }

        if (totalAbc > directAcquisitionThreshold)
        {
            return ApiResponse<Guid>.Fail($"Direct Acquisition is only applicable for Total ABC ≤ ₱{directAcquisitionThreshold:N2}. Current ABC is ₱{totalAbc:N2}.");
        }

        // 4. Generate or Validate DA Number
        int currentYear = DateTime.UtcNow.Year;
        string daNumber = req.DANumber?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(daNumber))
        {
            var allDas = await unitOfWork.DirectAcquisitionRepository.Query()
                .Select(d => d.DANumber)
                .ToListAsync(cancellationToken);

            int maxSeq = 0;
            var pattern = new Regex($@"^DA-{currentYear}-(\d+)$", RegexOptions.IgnoreCase);

            foreach (var existingNum in allDas)
            {
                var match = pattern.Match(existingNum);
                if (match.Success && int.TryParse(match.Groups[1].Value, out int seq))
                {
                    if (seq > maxSeq) maxSeq = seq;
                }
            }

            daNumber = $"DA-{currentYear}-{(maxSeq + 1):D4}";
        }
        else
        {
            var existingDa = await unitOfWork.DirectAcquisitionRepository
                .FindAsync(d => d.DANumber.ToLower() == daNumber.ToLower(), cancellationToken);
            if (existingDa != null)
            {
                return ApiResponse<Guid>.Fail($"A Direct Acquisition record with DA Number '{daNumber}' already exists.");
            }
        }

        Guid? createdByUserId = null;
        if (Guid.TryParse(currentUserService.UserId, out var actorId))
        {
            createdByUserId = actorId;
        }

        var directAcquisition = new DirectAcquisition
        {
            DANumber = daNumber,
            ConsolidatedPRId = req.ConsolidatedPRId,
            BACProjectId = req.BACProjectId.HasValue && req.BACProjectId.Value != Guid.Empty ? req.BACProjectId : null,
            TotalABC = totalAbc,
            Remarks = remarks,
            Status = DirectAcquisitionStatusEnum.DRAFT,
            CreatedByUserId = createdByUserId
        };

        await unitOfWork.DirectAcquisitionRepository.AddAsync(directAcquisition, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(directAcquisition.Id, $"Direct Acquisition '{daNumber}' created successfully.");
    }
}
