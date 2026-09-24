using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using FluentValidation;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.RecordBidOpening;

public class RecordBidOpeningCommandHandler(
    IUnitOfWork unitOfWork,
    ICurrentUserService currentUserService)
    : IRequestHandler<RecordBidOpeningCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(RecordBidOpeningCommand command, CancellationToken cancellationToken)
    {
        var project = await unitOfWork.ProcurementProjectRepository
            .GetWithPublicDetailsByIdAsync(command.ProjectId, cancellationToken)
            ?? await unitOfWork.ProcurementProjectRepository.GetByIdAsync(command.ProjectId, cancellationToken)
            ?? throw new NotFoundException("Procurement project not found.");

        var submission = await unitOfWork.BiddingSubmissionRepository
            .GetByIdAsync(command.Request.BiddingSubmissionId, cancellationToken)
            ?? throw new NotFoundException("Bidding submission not found.");

        if (submission.ProcurementProjectId != command.ProjectId)
        {
            throw new FluentValidation.ValidationException("The bidding submission does not belong to this procurement project.");
        }

        // Determine Opening Schedule ID
        var openingSchedule = project.BiddingActivitySchedules?
            .FirstOrDefault(s => s.ProcurementActivityType?.SystemRole == ProcurementActivitySystemRole.SubmissionOpeningOfBids)
            ?? project.BiddingActivitySchedules?.FirstOrDefault();

        Guid scheduleId;
        if (command.Request.BiddingActivityScheduleId.HasValue && command.Request.BiddingActivityScheduleId.Value != Guid.Empty)
        {
            scheduleId = command.Request.BiddingActivityScheduleId.Value;
        }
        else if (openingSchedule != null)
        {
            scheduleId = openingSchedule.Id;
        }
        else
        {
            var existingSchedule = await unitOfWork.BiddingActivityScheduleRepository.FindAsync(
                s => s.ProcurementProjectId == command.ProjectId && !s.IsDeleted, cancellationToken);

            if (existingSchedule != null)
            {
                scheduleId = existingSchedule.Id;
            }
            else
            {
                var openingActivityType = await unitOfWork.ProcurementActivityTypeRepository.FindAsync(
                    a => a.SystemRole == ProcurementActivitySystemRole.SubmissionOpeningOfBids, cancellationToken)
                    ?? await unitOfWork.ProcurementActivityTypeRepository.FindAsync(a => !a.IsDeleted, cancellationToken);

                var newSchedule = new BiddingActivitySchedule
                {
                    Id = Guid.NewGuid(),
                    ProcurementProjectId = command.ProjectId,
                    ProcurementActivityTypeId = openingActivityType?.Id ?? Guid.Empty,
                    StartDate = DateTime.UtcNow,
                    EndDate = DateTime.UtcNow.AddDays(7),
                    Venue = "BAC Conference Room",
                    Status = "Completed",
                    CreatedBy = "BAC Officer"
                };
                await unitOfWork.BiddingActivityScheduleRepository.AddAsync(newSchedule, cancellationToken);
                scheduleId = newSchedule.Id;
            }
        }

        // ── 1. Enforce Envelope 1 Examination ─────────────────────────────────
        if (string.IsNullOrWhiteSpace(command.Request.Envelope1Result) ||
            command.Request.Envelope1Result.Equals("Pending", StringComparison.OrdinalIgnoreCase))
        {
            throw new FluentValidation.ValidationException("Envelope 1 examination result must be explicitly recorded as Passed or Failed.");
        }

        var isPassed = string.Equals(command.Request.Envelope1Result, "Passed", StringComparison.OrdinalIgnoreCase);
        var isFailed = string.Equals(command.Request.Envelope1Result, "Failed", StringComparison.OrdinalIgnoreCase);

        if (!isPassed && !isFailed)
        {
            throw new FluentValidation.ValidationException("Envelope 1 result must be either 'Passed' or 'Failed'.");
        }

        if (isFailed)
        {
            if (string.IsNullOrWhiteSpace(command.Request.DisqualificationReason))
            {
                throw new FluentValidation.ValidationException("Disqualification reason is required when Envelope 1 fails.");
            }

            if (command.Request.Envelope2Opened)
            {
                throw new FluentValidation.ValidationException("Envelope 2 cannot be opened when Envelope 1 has failed the initial examination.");
            }

            if (command.Request.AsReadBidAmount.HasValue)
            {
                throw new FluentValidation.ValidationException("As-Read Bid Amount cannot be accepted for a disqualified bidder.");
            }
        }

        // ── 2. Enforce Envelope 2 Gating & As-Read Invariants ──────────────────
        if (command.Request.Envelope2Opened && !isPassed)
        {
            throw new FluentValidation.ValidationException("Envelope 2 cannot be opened unless Envelope 1 has been examined and marked as Passed.");
        }

        var envelope2Opened = isPassed && command.Request.Envelope2Opened;

        if (command.Request.AsReadBidAmount.HasValue && !envelope2Opened)
        {
            throw new FluentValidation.ValidationException("As-Read Bid Amount cannot be accepted while Envelope 2 remains sealed.");
        }

        if (envelope2Opened)
        {
            if (!command.Request.AsReadBidAmount.HasValue || command.Request.AsReadBidAmount.Value <= 0)
            {
                throw new FluentValidation.ValidationException("A valid positive As-Read Bid Amount is required when Envelope 2 is opened.");
            }

            var roundedSubmissionAmount = Math.Round(submission.OriginalProposedAmount, 2, MidpointRounding.AwayFromZero);
            var roundedAsReadAmount = Math.Round(command.Request.AsReadBidAmount.Value, 2, MidpointRounding.AwayFromZero);

            if (roundedSubmissionAmount > 0 && Math.Abs(roundedSubmissionAmount - roundedAsReadAmount) > 0.009m)
            {
                if (string.IsNullOrWhiteSpace(command.Request.Remarks))
                {
                    throw new FluentValidation.ValidationException(
                        $"A variance exists between the supplier-submitted amount (₱{roundedSubmissionAmount:N2}) and the recorded As-Read amount (₱{roundedAsReadAmount:N2}). System policy requires explanatory BAC remarks when recording an As-Read amount that differs from the submitted proposal.");
                }
            }
        }

        var asReadAmount = envelope2Opened && command.Request.AsReadBidAmount.HasValue
            ? Math.Round(command.Request.AsReadBidAmount.Value, 2, MidpointRounding.AwayFromZero)
            : (decimal?)null;

        var openingRecord = submission.BidOpeningRecord;

        // ── 3. Preserve Historical State: Cannot silently revert opened Envelope 2 ──
        if (openingRecord != null && openingRecord.Envelope2Opened)
        {
            if (!isPassed || !envelope2Opened)
            {
                throw new FluentValidation.ValidationException("An already-opened Envelope 2 cannot be reverted to sealed or failed.");
            }
        }

        var actorName = currentUserService.Name ?? currentUserService.Username ?? "BAC Officer";
        var actorId = Guid.TryParse(currentUserService.UserId, out var parsedId) ? parsedId : (Guid?)null;

        if (openingRecord == null)
        {
            openingRecord = new BidOpeningRecord
            {
                BiddingSubmissionId = submission.Id,
                BiddingActivityScheduleId = scheduleId,
                Envelope1Result = isPassed ? "Passed" : "Failed",
                Envelope2Opened = envelope2Opened,
                AsReadBidAmount = asReadAmount,
                DisqualificationReason = !isPassed ? command.Request.DisqualificationReason : null,
                Remarks = command.Request.Remarks,
                OpenedById = actorId,
                OpenedByName = actorName,
                OpenedAt = DateTime.UtcNow,
                CreatedBy = actorName
            };

            submission.BidOpeningRecord = openingRecord;
        }
        else
        {
            openingRecord.Envelope1Result = isPassed ? "Passed" : "Failed";
            openingRecord.Envelope2Opened = envelope2Opened;
            openingRecord.AsReadBidAmount = asReadAmount;
            openingRecord.DisqualificationReason = !isPassed ? command.Request.DisqualificationReason : null;
            openingRecord.Remarks = command.Request.Remarks;
            openingRecord.OpenedById = actorId ?? openingRecord.OpenedById;
            openingRecord.OpenedByName = actorName;
            openingRecord.OpenedAt = DateTime.UtcNow;
            openingRecord.UpdatedAt = DateTime.UtcNow;
            openingRecord.UpdatedBy = actorName;
        }

        unitOfWork.BiddingSubmissionRepository.Update(submission);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(openingRecord.Id, "Bid opening record saved successfully.");
    }
}
