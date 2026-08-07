using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using MediatR;

using OpcrEntity = ERPEZ.Domain.Entities.Planning.OPCR;
using WfpEntity = ERPEZ.Domain.Entities.Planning.WFP;
using WfpObjectiveEntity = ERPEZ.Domain.Entities.Planning.WFPObjective;
using WfpObjectiveActivityEntity = ERPEZ.Domain.Entities.Planning.WFPObjectiveActivity;
using WfpObjectiveTimelineEntity = ERPEZ.Domain.Entities.Planning.WFPObjectiveTimeline;
using WfpObjectiveActivityExpenditureEntity = ERPEZ.Domain.Entities.Planning.WFPObjectiveActivityExpenditure;

namespace ERPEZ.Application.Features.Planning.WFP.Commands.CreateWFP;

public class CreateWFPCommandHandler(IUnitOfWork unitOfWork, ICurrentUserService currentUserService) : IRequestHandler<CreateWFPCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateWFPCommand request, CancellationToken cancellationToken)
    {
        // Sanitize Foreign Key GUIDs (convert Guid.Empty to null)
        var officeId = request.OfficeId;
        var opcrId = (request.OPCRId.HasValue && request.OPCRId.Value != Guid.Empty) ? request.OPCRId.Value : (Guid?)null;
        var fundSourceId = (request.FundSourceId.HasValue && request.FundSourceId.Value != Guid.Empty) ? request.FundSourceId.Value : (Guid?)null;

        _ = await unitOfWork.OfficeRepository.FindAsync(
            x => x.Id == officeId,
            cancellationToken) ?? throw new NotFoundException($"Office with ID '{officeId}' not found in database.");

        if (fundSourceId.HasValue)
        {
            _ = await unitOfWork.FundSourceRepository.FindAsync(
                x => x.Id == fundSourceId.Value,
                cancellationToken) ?? throw new NotFoundException($"Selected Fund Source with ID '{fundSourceId.Value}' not found in database.");
        }

        var duplicate = await unitOfWork.WFPRepository.FindAsync(w => w.ProjectTitle == request.ProjectTitle
            && w.OfficeId == officeId
            && w.Mode == request.Mode,
            cancellationToken
        );

        if (duplicate != null)
            throw new ConflictException("Work and Financial Plan with the same Office, Mode, and Project Title already exists.");

        OpcrEntity? sourceOpcr = null;
        if (request.Mode == ModeEnum.OPCR)
        {
            if (!opcrId.HasValue)
                throw new BadRequestException("OPCR ID is required when Mode is set to OPCR.");

            sourceOpcr = await unitOfWork.OPCRRepository.GetOPCRWithDetailsAsync(opcrId.Value, cancellationToken)
                ?? throw new NotFoundException($"Selected Source OPCR with ID '{opcrId.Value}' not found in database.");
        }

        var wfpId = Guid.Empty;
        var currentUserId = string.IsNullOrWhiteSpace(currentUserService.UserId) ? "system" : currentUserService.UserId;
        var now = DateTime.UtcNow;

        await unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            var wfp = new WfpEntity
            {
                OfficeId = officeId,
                ProjectTitle = request.ProjectTitle,
                ProjectOwner = request.ProjectOwner,
                OPCRId = opcrId,
                FundSourceId = fundSourceId,
                ProjectStartDate = request.ProjectStartDate,
                ProjectEndDate = request.ProjectEndDate,
                ProposedBudget = request.ProposedBudget ?? 0m,
                GeneralObjective = request.GeneralObjective,
                Mode = request.Mode,
                Status = StatusEnum.Draft,
                CreatedAt = now,
                CreatedBy = currentUserId,
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
                        Weight = 0m,
                        CreatedAt = now,
                        CreatedBy = currentUserId,
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
                            // Verify OPCRActivity exists in DB to prevent foreign key violation
                            var opcrActivityExists = activity.Id != Guid.Empty &&
                                (await unitOfWork.OPCRActivityRepository.FindAsync(a => a.Id == activity.Id, cancellationToken)) != null;

                            var wfpActivity = new WfpObjectiveActivityEntity
                            {
                                WFPId = wfp.Id,
                                WFPObjectiveId = wfpObjective.Id,
                                OPCRActivityId = opcrActivityExists ? activity.Id : null,
                                ActivityName = string.IsNullOrWhiteSpace(activity.Name) ? "OPCR Activity" : activity.Name,
                                Indicator = string.IsNullOrWhiteSpace(activity.Description) ? activity.Name : activity.Description,
                                Weight = 0m,
                                CreatedAt = now,
                                CreatedBy = currentUserId,
                            };

                            await unitOfWork.WFPObjectiveActivityRepository.AddAsync(wfpActivity, cancellationToken);
                            await unitOfWork.SaveChangesAsync(cancellationToken);

                            // Create quarterly timeline target distributions (Q1-Q4) using KPIAssignment/OPCRItem values
                            var timelines = new List<WfpObjectiveTimelineEntity>
                            {
                                new() { WFPObjectiveActivityId = wfpActivity.Id, TimelineType = TimelineTypeEnum.Quarterly, StartDate = new DateOnly(year, 1, 1), EndDate = new DateOnly(year, 3, 31), TargetValue = q1Val, CreatedAt = now, CreatedBy = currentUserId },
                                new() { WFPObjectiveActivityId = wfpActivity.Id, TimelineType = TimelineTypeEnum.Quarterly, StartDate = new DateOnly(year, 4, 1), EndDate = new DateOnly(year, 6, 30), TargetValue = q2Val, CreatedAt = now, CreatedBy = currentUserId },
                                new() { WFPObjectiveActivityId = wfpActivity.Id, TimelineType = TimelineTypeEnum.Quarterly, StartDate = new DateOnly(year, 7, 1), EndDate = new DateOnly(year, 9, 30), TargetValue = q3Val, CreatedAt = now, CreatedBy = currentUserId },
                                new() { WFPObjectiveActivityId = wfpActivity.Id, TimelineType = TimelineTypeEnum.Quarterly, StartDate = new DateOnly(year, 10, 1), EndDate = new DateOnly(year, 12, 31), TargetValue = q4Val, CreatedAt = now, CreatedBy = currentUserId }
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
                                    UnitCost = activity.Budget,
                                    CreatedAt = now,
                                    CreatedBy = currentUserId,
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
