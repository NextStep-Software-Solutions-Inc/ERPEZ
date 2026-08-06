using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

using OpcrEntity = ERPEZ.Domain.Entities.Planning.OPCR;
using WfpEntity = ERPEZ.Domain.Entities.Planning.WFP;
using WfpObjectiveEntity = ERPEZ.Domain.Entities.Planning.WFPObjective;
using WfpObjectiveActivityEntity = ERPEZ.Domain.Entities.Planning.WFPObjectiveActivity;
using WfpObjectiveTimelineEntity = ERPEZ.Domain.Entities.Planning.WFPObjectiveTimeline;
using WfpObjectiveActivityExpenditureEntity = ERPEZ.Domain.Entities.Planning.WFPObjectiveActivityExpenditure;

namespace ERPEZ.Application.Features.Planning.WFP.Commands.CreateWFP;

public class CreateWFPCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateWFPCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateWFPCommand request, CancellationToken cancellationToken)
    {
        _ = await unitOfWork.OfficeRepository.FindAsync(
            x => x.Id == request.OfficeId,
            cancellationToken) ?? throw new NotFoundException("Office not found.");

        if (request.FundSourceId.HasValue)
        {
            _ = await unitOfWork.FundSourceRepository.FindAsync(
                x => x.Id == request.FundSourceId.Value,
                cancellationToken) ?? throw new NotFoundException("Selected Fund Source not found in database.");
        }

        var duplicate = await unitOfWork.WFPRepository.FindAsync(w => w.ProjectTitle == request.ProjectTitle
            && w.OfficeId == request.OfficeId
            && w.Mode == request.Mode,
            cancellationToken
        );

        if (duplicate != null)
            throw new ConflictException("Work and Financial Plan with the same Office, Mode, and Project Title already exists.");

        OpcrEntity? sourceOpcr = null;
        if (request.Mode == ModeEnum.OPCR)
        {
            if (!request.OPCRId.HasValue)
                throw new BadRequestException("OPCR ID is required when Mode is set to OPCR.");

            sourceOpcr = await unitOfWork.OPCRRepository.GetOPCRWithDetailsAsync(request.OPCRId.Value, cancellationToken)
                ?? throw new NotFoundException("Selected Source OPCR not found in database.");
        }

        var wfpId = Guid.Empty;

        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var wfp = new WfpEntity
            {
                OfficeId = request.OfficeId,
                ProjectTitle = request.ProjectTitle,
                ProjectOwner = request.ProjectOwner,
                OPCRId = request.OPCRId,
                FundSourceId = request.FundSourceId,
                ProjectStartDate = request.ProjectStartDate,
                ProjectEndDate = request.ProjectEndDate,
                ProposedBudget = request.ProposedBudget ?? 0m,
                GeneralObjective = request.GeneralObjective,
                Mode = request.Mode,
                Status = StatusEnum.Draft,
            };

            await unitOfWork.WFPRepository.AddAsync(wfp, cancellationToken);
            await unitOfWork.SaveChangesAsync(cancellationToken);
            wfpId = wfp.Id;

            // When in OPCR Mode, auto-import associated objectives, activities, timelines, and expenditures
            if (request.Mode == ModeEnum.OPCR && sourceOpcr != null && sourceOpcr.OPCRItems != null)
            {
                decimal aggregatedBudget = 0m;
                var year = request.ProjectStartDate.Year > 0 ? request.ProjectStartDate.Year : DateTime.UtcNow.Year;

                foreach (var opcrItem in sourceOpcr.OPCRItems)
                {
                    var objectiveName = opcrItem.KPIAssignment?.FYActiveKPI?.MasterKPI?.Name
                        ?? opcrItem.KPIAssignment?.FYActiveKPI?.MFOPAP?.Name
                        ?? "OPCR Objective";

                    var wfpObjective = new WfpObjectiveEntity
                    {
                        WFPId = wfp.Id,
                        Description = objectiveName,
                        Weight = 0m
                    };

                    await unitOfWork.WFPObjectiveRepository.AddAsync(wfpObjective, cancellationToken);
                    await unitOfWork.SaveChangesAsync(cancellationToken);

                    // Extract quarterly targets from OPCRItem / KPIAssignment
                    var q1Val = opcrItem.Q1Target > 0 ? opcrItem.Q1Target : (opcrItem.KPIAssignment?.AssignedTargetQ1 ?? 25m);
                    var q2Val = opcrItem.Q2Target > 0 ? opcrItem.Q2Target : (opcrItem.KPIAssignment?.AssignedTargetQ2 ?? 25m);
                    var q3Val = opcrItem.Q3Target > 0 ? opcrItem.Q3Target : (opcrItem.KPIAssignment?.AssignedTargetQ3 ?? 25m);
                    var q4Val = opcrItem.Q4Target > 0 ? opcrItem.Q4Target : (opcrItem.KPIAssignment?.AssignedTargetQ4 ?? 25m);

                    if (opcrItem.OPCRActivities != null)
                    {
                        foreach (var activity in opcrItem.OPCRActivities)
                        {
                            var wfpActivity = new WfpObjectiveActivityEntity
                            {
                                WFPId = wfp.Id,
                                WFPObjectiveId = wfpObjective.Id,
                                OPCRActivityId = activity.Id,
                                ActivityName = string.IsNullOrWhiteSpace(activity.Name) ? "OPCR Activity" : activity.Name,
                                Indicator = string.IsNullOrWhiteSpace(activity.Description) ? activity.Name : activity.Description,
                                Weight = 0m
                            };

                            await unitOfWork.WFPObjectiveActivityRepository.AddAsync(wfpActivity, cancellationToken);
                            await unitOfWork.SaveChangesAsync(cancellationToken);

                            // Create quarterly timeline target distributions (Q1-Q4) using KPIAssignment/OPCRItem values
                            var timelines = new List<WfpObjectiveTimelineEntity>
                            {
                                new() { WFPObjectiveActivityId = wfpActivity.Id, TimelineType = TimelineTypeEnum.Quarterly, StartDate = new DateOnly(year, 1, 1), EndDate = new DateOnly(year, 3, 31), TargetValue = q1Val },
                                new() { WFPObjectiveActivityId = wfpActivity.Id, TimelineType = TimelineTypeEnum.Quarterly, StartDate = new DateOnly(year, 4, 1), EndDate = new DateOnly(year, 6, 30), TargetValue = q2Val },
                                new() { WFPObjectiveActivityId = wfpActivity.Id, TimelineType = TimelineTypeEnum.Quarterly, StartDate = new DateOnly(year, 7, 1), EndDate = new DateOnly(year, 9, 30), TargetValue = q3Val },
                                new() { WFPObjectiveActivityId = wfpActivity.Id, TimelineType = TimelineTypeEnum.Quarterly, StartDate = new DateOnly(year, 10, 1), EndDate = new DateOnly(year, 12, 31), TargetValue = q4Val }
                            };

                            foreach (var timeline in timelines)
                            {
                                await unitOfWork.WFPObjectiveTimelineRepository.AddAsync(timeline, cancellationToken);
                            }

                            // Create initial expenditure allocation record if activity has budget
                            if (activity.Budget > 0m)
                            {
                                var expenditure = new WfpObjectiveActivityExpenditureEntity
                                {
                                    WFPObjectiveActivityId = wfpActivity.Id,
                                    ItemDescription = activity.Name,
                                    Quantity = 1,
                                    UnitCost = activity.Budget
                                };
                                await unitOfWork.WFPObjectiveActivityExpenditureRepository.AddAsync(expenditure, cancellationToken);
                                aggregatedBudget += activity.Budget;
                            }
                        }
                    }
                }

                if (aggregatedBudget > 0m)
                {
                    wfp.ProposedBudget = aggregatedBudget;
                    await unitOfWork.SaveChangesAsync(cancellationToken);
                }
            }
        }, cancellationToken);

        return ApiResponse<Guid>.Success(wfpId, "Work and Financial Plan created successfully.");
    }
}
