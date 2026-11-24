using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Utils;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.NoticeOfAwards.Commands.LogNoticeOfAwardMilestone;

public class LogNoticeOfAwardMilestoneCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<LogNoticeOfAwardMilestoneCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(LogNoticeOfAwardMilestoneCommand command, CancellationToken cancellationToken)
    {
        var noa = await unitOfWork.NoticeOfAwardRepository.FindAsync(n => n.Id == command.Id, cancellationToken);
        if (noa == null)
        {
            return ApiResponse<Unit>.Fail("Notice of Award not found.");
        }

        if (noa.Status != NoticeOfAwardStatus.Approved)
        {
            return ApiResponse<Unit>.Fail($"Contract execution milestones can only be logged for Approved Notice of Awards. Current status: '{noa.Status}'.");
        }

        var req = command.Request;

        var todayPht = NoticeOfAwardSlaCalculator.ToPhilippineDate(DateTime.UtcNow);
        var dateLogged = req.DateLogged != default ? req.DateLogged : todayPht;

        if (req.MilestoneType == NoticeOfAwardMilestoneType.ConformeReceived)
        {
            if (dateLogged > todayPht)
            {
                return ApiResponse<Unit>.Fail("NOA Receipt / Conforme date cannot be in the future.");
            }

            if (noa.IssuedAt.HasValue)
            {
                var issuedDatePht = NoticeOfAwardSlaCalculator.ToPhilippineDate(noa.IssuedAt.Value);
                if (dateLogged < issuedDatePht)
                {
                    return ApiResponse<Unit>.Fail($"NOA Receipt date ({dateLogged:yyyy-MM-dd}) cannot be earlier than the NOA issuance date ({issuedDatePht:yyyy-MM-dd}).");
                }
            }
        }

        var allMilestones = await unitOfWork.NoticeOfAwardMilestoneRepository.ToListAsync(
            unitOfWork.NoticeOfAwardMilestoneRepository.Query(m => m.NoticeOfAwardId == command.Id && !m.IsDeleted),
            cancellationToken
        );

        var hasConforme = allMilestones.Any(m => m.MilestoneType == NoticeOfAwardMilestoneType.ConformeReceived);
        var hasSecurity = allMilestones.Any(m => m.MilestoneType == NoticeOfAwardMilestoneType.PerformanceSecurityPosted);

        if (req.MilestoneType == NoticeOfAwardMilestoneType.PerformanceSecurityPosted && !hasConforme)
        {
            return ApiResponse<Unit>.Fail("NOA Conforme / Receipt must be recorded before posting Performance Security.");
        }

        var requiresPerformanceSecurity = true;
        if (noa.ProcurementProjectId != Guid.Empty)
        {
            var project = await unitOfWork.ProcurementProjectRepository.FindAsync(p => p.Id == noa.ProcurementProjectId, cancellationToken);
            if (project?.ProcurementModeId.HasValue == true)
            {
                var mode = await unitOfWork.ProcurementModeRepository.FindAsync(m => m.Id == project.ProcurementModeId.Value, cancellationToken);
                if (mode != null)
                {
                    var modeName = mode.Name.Trim();
                    // RA 12009 / NGPA Section 94: Shopping and Small Value Procurement are exempt from Performance Security
                    if (modeName.Contains("Shopping", StringComparison.OrdinalIgnoreCase) ||
                        modeName.Contains("Small Value", StringComparison.OrdinalIgnoreCase))
                    {
                        requiresPerformanceSecurity = false;
                    }
                }
            }
        }

        if (req.MilestoneType == NoticeOfAwardMilestoneType.ContractExecuted && requiresPerformanceSecurity && !hasSecurity)
        {
            return ApiResponse<Unit>.Fail("Performance Security must be posted before Contract Execution.");
        }

        var existingMilestone = allMilestones.FirstOrDefault(m => m.MilestoneType == req.MilestoneType);

        if (existingMilestone != null)
        {
            existingMilestone.DateLogged = dateLogged;
            existingMilestone.FileId = req.FileId ?? existingMilestone.FileId;
            existingMilestone.FileName = req.FileName ?? existingMilestone.FileName;
            existingMilestone.Remarks = req.Remarks ?? existingMilestone.Remarks;
            existingMilestone.LoggedById = command.ActorId;
            existingMilestone.LoggedByName = command.ActorName;
            existingMilestone.UpdatedAt = DateTime.UtcNow;
            existingMilestone.UpdatedBy = command.ActorName;

            unitOfWork.NoticeOfAwardMilestoneRepository.Update(existingMilestone);
        }
        else
        {
            var milestone = new NoticeOfAwardMilestone
            {
                Id = Guid.NewGuid(),
                NoticeOfAwardId = command.Id,
                MilestoneType = req.MilestoneType,
                DateLogged = dateLogged,
                FileId = req.FileId,
                FileName = req.FileName,
                LoggedById = command.ActorId,
                LoggedByName = command.ActorName,
                Remarks = req.Remarks,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = command.ActorName,
                UpdatedAt = DateTime.UtcNow,
                UpdatedBy = command.ActorName
            };

            await unitOfWork.NoticeOfAwardMilestoneRepository.AddAsync(milestone, cancellationToken);
        }

        // Authoritatively synchronize ReceivedAt and ContractExecutionDeadline from ConformeReceived
        if (req.MilestoneType == NoticeOfAwardMilestoneType.ConformeReceived)
        {
            noa.ReceivedAt = dateLogged;
            noa.ContractExecutionDeadline = dateLogged.AddDays(10);
            noa.UpdatedAt = DateTime.UtcNow;
            noa.UpdatedBy = command.ActorName;
            unitOfWork.NoticeOfAwardRepository.Update(noa);
        }

        var milestoneName = req.MilestoneType switch
        {
            NoticeOfAwardMilestoneType.ConformeReceived => "Conforme Received",
            NoticeOfAwardMilestoneType.PerformanceSecurityPosted => "Performance Security Posted",
            NoticeOfAwardMilestoneType.ContractExecuted => "Contract Executed",
            _ => req.MilestoneType.ToString()
        };

        var activity = new NoticeOfAwardActivity
        {
            Id = Guid.NewGuid(),
            NoticeOfAwardId = command.Id,
            Action = $"Logged Milestone: {milestoneName}",
            ActorId = command.ActorId,
            ActorName = command.ActorName,
            Timestamp = DateTime.UtcNow,
            Notes = req.Remarks ?? $"Milestone '{milestoneName}' recorded for {dateLogged:yyyy-MM-dd}.",
            CreatedAt = DateTime.UtcNow,
            CreatedBy = command.ActorName
        };

        await unitOfWork.NoticeOfAwardActivityRepository.AddAsync(activity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Milestone '{milestoneName}' logged successfully.");
    }
}
