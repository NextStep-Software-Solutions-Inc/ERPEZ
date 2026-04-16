using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIBAmendmentRequest.Commands.CreateLIBAmendmentRequest;

public class CreateLIBAmendmentRequestCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateLIBAmendmentRequestCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateLIBAmendmentRequestCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        var originalLIB = await unitOfWork.LineItemBudgetRepository.GetByIdWithDetailsAsync(
            request.LineItemBudgetId, cancellationToken)
            ?? throw new NotFoundException($"LIB with ID {request.LineItemBudgetId} not found.");

        if (!originalLIB.Status.Equals("Approved", StringComparison.OrdinalIgnoreCase))
            throw new ValidationException("Only Approved LIBs can be amended.");

        var newVersion = originalLIB.Version + 1;
        var newLIBNumber = $"{originalLIB.LIBNumber}-v{newVersion}";

        var newLIBId = Guid.NewGuid();
        var newLIB = new Domain.Entities.Planning.LineItemBudget
        {
            Id = newLIBId,
            FiscalYearId = originalLIB.FiscalYearId,
            FundClusterId = originalLIB.FundClusterId,
            OfficeId = originalLIB.OfficeId,
            ParentLIBId = originalLIB.ParentLIBId,
            DeliveryUnitId = originalLIB.DeliveryUnitId,
            Scope = originalLIB.Scope,
            Name = originalLIB.Name,
            LIBNumber = newLIBNumber,
            Level = originalLIB.Level,
            SourceType = originalLIB.SourceType,
            SourceId = originalLIB.SourceId,
            Status = "Draft",
            ConsolidatedIntoLIBId = originalLIB.ConsolidatedIntoLIBId,
            TotalAmount = originalLIB.TotalAmount,
            Version = newVersion,
            PreviousVersionId = originalLIB.Id
        };

        await unitOfWork.LineItemBudgetRepository.AddAsync(newLIB, cancellationToken);

        var activityIdMap = new Dictionary<Guid, Guid>();
        foreach (var activity in originalLIB.LineItemBudgetActivities.Where(a => !a.IsDeleted))
        {
            var newActivityId = Guid.NewGuid();
            activityIdMap[activity.Id] = newActivityId;

            var newActivity = new Domain.Entities.Planning.LineItemBudgetActivity
            {
                Id = newActivityId,
                LineItemBudgetId = newLIBId,
                WFPObjectiveActivityId = activity.WFPObjectiveActivityId,
                OPCRActivityId = activity.OPCRActivityId,
                Name = activity.Name
            };
            await unitOfWork.LineItemBudgetActivityRepository.AddAsync(newActivity, cancellationToken);
        }

        foreach (var detail in originalLIB.LineItemBudgetDetails.Where(d => !d.IsDeleted))
        {
            Guid? mappedActivityId = detail.LineItemBudgetActivityId.HasValue
                && activityIdMap.TryGetValue(detail.LineItemBudgetActivityId.Value, out var mapped)
                ? mapped
                : detail.LineItemBudgetActivityId;

            var newDetail = new Domain.Entities.Planning.LineItemBudgetDetail
            {
                LineItemBudgetId = newLIBId,
                LineItemBudgetActivityId = mappedActivityId,
                WFPObjectiveActivityExpenditureId = detail.WFPObjectiveActivityExpenditureId,
                ObjectId = detail.ObjectId,
                Description = detail.Description,
                TimelineType = detail.TimelineType,
                StartDate = detail.StartDate,
                EndDate = detail.EndDate,
                Budget = detail.Budget
            };
            await unitOfWork.LineItemBudgetDetailRepository.AddAsync(newDetail, cancellationToken);
        }

        var entity = new Domain.Entities.Planning.LIBAmendmentRequest
        {
            LineItemBudgetId = request.LineItemBudgetId,
            ProposedLineItemBudgetId = newLIBId,
            Reason = request.Reason,
            Justification = request.Justification,
            Status = "Draft"
        };

        await unitOfWork.LIBAmendmentRequestRepository.AddAsync(entity, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(entity.Id, "LIB Amendment Request created successfully.");
    }
}

