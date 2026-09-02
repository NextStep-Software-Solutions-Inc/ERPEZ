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
            .GetByIdAsync(command.ProjectId, cancellationToken)
            ?? throw new NotFoundException("Procurement project not found.");

        var submission = await unitOfWork.BiddingSubmissionRepository
            .GetByIdAsync(command.Request.BiddingSubmissionId, cancellationToken)
            ?? throw new NotFoundException("Bidding submission not found.");

        if (submission.ProcurementProjectId != command.ProjectId)
        {
            throw new FluentValidation.ValidationException("The bidding submission does not belong to this procurement project.");
        }

        // Determine Opening Schedule ID
        var openingSchedule = project.BiddingActivitySchedules
            .FirstOrDefault(s => s.ProcurementActivityType?.SystemRole == ProcurementActivitySystemRole.SubmissionOpeningOfBids);

        var scheduleId = command.Request.BiddingActivityScheduleId 
            ?? openingSchedule?.Id 
            ?? throw new FluentValidation.ValidationException("No opening of bids activity schedule found for this project.");

        // Enforce Envelope 1 & 2 Gating Invariant
        var isPassed = string.Equals(command.Request.Envelope1Result, "Passed", StringComparison.OrdinalIgnoreCase);
        if (!isPassed)
        {
            if (string.IsNullOrWhiteSpace(command.Request.DisqualificationReason))
            {
                throw new FluentValidation.ValidationException("Disqualification reason is required when Envelope 1 fails.");
            }
        }

        var envelope2Opened = isPassed && command.Request.Envelope2Opened;
        var asReadAmount = envelope2Opened 
            ? (command.Request.AsReadBidAmount ?? submission.OriginalProposedAmount)
            : (decimal?)null;

        var actorName = currentUserService.Name ?? currentUserService.Username ?? "BAC Officer";
        var actorId = Guid.TryParse(currentUserService.UserId, out var parsedId) ? parsedId : (Guid?)null;

        var openingRecord = submission.BidOpeningRecord;
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
