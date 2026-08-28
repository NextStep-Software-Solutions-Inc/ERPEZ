using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using ERPEZ.Application.Features.Planning.APPItem.Dtos;
using ERPEZ.Application.Features.Planning.BACResolutionWhereasClause.Dtos;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.Projects.Dtos;

public record ProcurementProjectResponse
{
    public Guid Id { get; init; }
    public ProcurementProjectSourceType SourceType { get; init; }
    public Guid? APPItemId { get; init; }
    public Guid? ConsolidatedPRId { get; init; }
    public string Title { get; init; } = string.Empty;
    public APPItemResponse? APPItem { get; init; }
    public ConsolidatedPRSummaryResponse? ConsolidatedPR { get; init; }
    public decimal ABC { get; init; }
    public string Status { get; init; } = string.Empty;
    public int AppItemCount { get; init; }
    public decimal SumABC { get; init; }

    // Top-level flattened resolution properties
    public string? ResolutionType { get; init; }
    public string? ResolutionNumber { get; init; }
    public DateTime? DateResolved { get; init; }
    public string? ResolvedLocation { get; init; }

    public static Expression<Func<ProcurementProject, ProcurementProjectResponse>> Projection => c => new ProcurementProjectResponse
    {
        Id = c.Id,
        SourceType = c.SourceType,
        APPItemId = c.APPItemId,
        ConsolidatedPRId = c.ConsolidatedPRId,
        Title = c.Title,
        AppItemCount = c.APPItemLinks.Count,
        SumABC = c.APPItemLinks.Sum(l => l.APPItem.EffectiveABC),
        APPItem = c.APPItem != null ? new APPItemResponse
        {
            Id = c.APPItem.Id,
            APPId = c.APPItem.APPId,
            PPMPItemId = c.APPItem.PPMPItemId,
            PPMPItemName = c.APPItem.PPMPItem != null ? c.APPItem.PPMPItem.Name : string.Empty,
            ProcurementModeId = c.APPItem.ProcurementModeId,
            ProcurementModeName = c.APPItem.ProcurementMode != null ? c.APPItem.ProcurementMode.Name : string.Empty,
            FundSourceId = c.APPItem.FundSourceId,
            FundSourceName = c.APPItem.FundSource != null ? c.APPItem.FundSource.Name : string.Empty,
            OfficeId = c.APPItem.OfficeId,
            OfficeName = c.APPItem.Office != null ? c.APPItem.Office.Name : string.Empty,
            PAPCode = c.APPItem.PAPCode,
            Remarks = c.APPItem.Remarks,
            IsEarlyProcurementActivity = c.APPItem.IsEarlyProcurementActivity,
            IsOutsourced = c.APPItem.IsOutsourced,
            BidEvaluationCriteria = c.APPItem.BidEvaluationCriteria,
            ProcurementStrategies = c.APPItem.ProcurementStrategies,
            CreatedAt = c.APPItem.CreatedAt,
            CreatedBy = c.APPItem.CreatedBy,
            UpdatedAt = c.APPItem.UpdatedAt,
            UpdatedBy = c.APPItem.UpdatedBy,
            EffectiveStartOfProcurement = c.APPItem.StartOfProcurementOverride ?? (c.APPItem.PPMPItem != null && c.APPItem.PPMPItem.ProcurementStartDate.HasValue ? c.APPItem.PPMPItem.ProcurementStartDate.Value.ToDateTime(TimeOnly.MinValue) : null),
            EffectiveEndOfProcurement = c.APPItem.EndOfProcurementOverride ?? (c.APPItem.PPMPItem != null && c.APPItem.PPMPItem.ProcurementEndDate.HasValue ? c.APPItem.PPMPItem.ProcurementEndDate.Value.ToDateTime(TimeOnly.MinValue) : null),
            StartOfProcurementOverride = c.APPItem.StartOfProcurementOverride,
            EndOfProcurementOverride = c.APPItem.EndOfProcurementOverride,
            EstimatedBudgetOverride = c.APPItem.EstimatedBudgetOverride,
            OriginalPPMPBudget = c.APPItem.OriginalPPMPBudget,
            EffectiveABC = c.APPItem.EffectiveABC,
            IsABCOverridden = c.APPItem.EstimatedBudgetOverride.HasValue,
            IsStartProcurementOverridden = c.APPItem.StartOfProcurementOverride.HasValue,
            IsEndProcurementOverridden = c.APPItem.EndOfProcurementOverride.HasValue,
            IsNew = c.APPItem.IsNew,
            IsRevised = c.APPItem.IsRevised,
            APP = c.APPItem.APP != null ? new APPItemAPPResponse
            {
                Id = c.APPItem.APP.Id,
                APPNumber = c.APPItem.APP.APPNumber,
                Name = c.APPItem.APP.Name
            } : null,
            PPMPItem = c.APPItem.PPMPItem != null ? new APPItemPPMPItemResponse
            {
                Id = c.APPItem.PPMPItem.Id,
                PAPCode = c.APPItem.PPMPItem.PAPCode,
                Name = c.APPItem.PPMPItem.Name,
                Description = c.APPItem.PPMPItem.Description,
                Unit = c.APPItem.PPMPItem.Unit,
                UnitPrice = c.APPItem.PPMPItem.UnitPrice
            } : null,
            ProcurementMode = c.APPItem.ProcurementMode != null ? new APPItemProcurementModeResponse
            {
                Id = c.APPItem.ProcurementMode.Id,
                Name = c.APPItem.ProcurementMode.Name,
                Description = c.APPItem.ProcurementMode.Description
            } : null,
            FundSource = c.APPItem.FundSource != null ? new APPItemFundSourceResponse
            {
                Id = c.APPItem.FundSource.Id,
                Name = c.APPItem.FundSource.Name,
                Code = c.APPItem.FundSource.Code
            } : null,
            Office = c.APPItem.Office != null ? new APPItemOfficeResponse
            {
                Id = c.APPItem.Office.Id,
                Name = c.APPItem.Office.Name,
                Code = c.APPItem.Office.Code
            } : null,
            Schedules = c.APPItem.PPMPItem != null && c.APPItem.PPMPItem.APPProcurementSchedules != null
                ? c.APPItem.PPMPItem.APPProcurementSchedules
                    .Where(schedule => !schedule.IsDeleted)
                    .Select(schedule => new APPItemScheduleReferenceResponse
                    {
                        Id = schedule.Id,
                        ProcurementActivityTypeId = schedule.ProcurementActivityTypeId,
                        ProcurementActivityTypeName = schedule.ProcurementActivityType != null ? schedule.ProcurementActivityType.Name : string.Empty,
                        ScheduledDate = schedule.ScheduledDate,
                        CustomDateText = schedule.CustomDateText
                    }).ToList()
                : new List<APPItemScheduleReferenceResponse>()
        } : null,
        ConsolidatedPR = c.ConsolidatedPR != null ? new ConsolidatedPRSummaryResponse
        {
            Id = c.ConsolidatedPR.Id,
            CPRNumber = c.ConsolidatedPR.CPRNumber,
            Description = c.ConsolidatedPR.Description ?? string.Empty,
            ModeOfProcurementId = c.ConsolidatedPR.ConsolidatedPRItems
                .Where(ci => ci.ProcurementModeId != null)
                .Select(ci => ci.ProcurementModeId)
                .FirstOrDefault(),
            ModeOfProcurementName = c.ConsolidatedPR.ConsolidatedPRItems
                .Where(ci => ci.ProcurementMode != null)
                .Select(ci => ci.ProcurementMode!.Name)
                .FirstOrDefault() ?? string.Empty
        } : null,
        ABC = c.ABC,
        Status = c.Status,
        ResolutionType = c.BACResolutions.Select(r => r.ResolutionType).FirstOrDefault(),
        ResolutionNumber = c.BACResolutions.Select(r => r.ResolutionNumber).FirstOrDefault(),
        DateResolved = c.BACResolutions.Select(r => (DateTime?)r.DateResolved).FirstOrDefault(),
        ResolvedLocation = c.BACResolutions.Select(r => r.ResolvedLocation).FirstOrDefault()
    };
}

public record ProcurementProjectDetailResponse : ProcurementProjectResponse
{
    public List<APPItemLinkResponse> AppItemLinks { get; init; } = new();
    public List<BACResolutionResponse> BACResolutions { get; init; } = new();
    public List<BiddingActivityScheduleResponse> BiddingActivitySchedules { get; init; } = new();
    public Guid? EndUserRepresentativeId { get; init; }
    public ProjectUserResponse? EndUserRepresentative { get; init; }
    public Guid? TechRepresentativeId { get; init; }
    public ProjectUserResponse? TechRepresentative { get; init; }
    public Guid? ApprovalAttachmentFileId { get; init; }

    public static Expression<Func<ProcurementProject, ProcurementProjectDetailResponse>> DetailProjection => c => new ProcurementProjectDetailResponse
    {
        Id = c.Id,
        SourceType = c.SourceType,
        APPItemId = c.APPItemId,
        ConsolidatedPRId = c.ConsolidatedPRId,
        Title = c.Title,
        AppItemCount = c.APPItemLinks.Count,
        SumABC = c.APPItemLinks.Sum(l => l.APPItem.EffectiveABC),
        AppItemLinks = c.APPItemLinks != null ? c.APPItemLinks.OrderBy(l => l.Order).Select(l => new APPItemLinkResponse
        {
            Id = l.Id,
            APPItemId = l.APPItemId,
            ItemNumber = l.APPItem != null && l.APPItem.PPMPItem != null ? l.APPItem.PPMPItem.Name : (l.APPItem != null ? l.APPItem.Remarks ?? string.Empty : string.Empty),
            Description = l.APPItem != null ? (l.APPItem.Remarks ?? (l.APPItem.PPMPItem != null ? l.APPItem.PPMPItem.Description : string.Empty)) : string.Empty,
            OfficeName = l.APPItem != null && l.APPItem.Office != null ? l.APPItem.Office.Name : string.Empty,
            EffectiveABC = l.APPItem != null ? l.APPItem.EffectiveABC : 0,
            Order = l.Order,
            AppNumber = l.APPItem != null && l.APPItem.APP != null ? l.APPItem.APP.APPNumber : string.Empty,
            AppName = l.APPItem != null && l.APPItem.APP != null ? l.APPItem.APP.Name : string.Empty,
        }).ToList() : new List<APPItemLinkResponse>(),
        APPItem = c.APPItem != null ? new APPItemResponse
        {
            Id = c.APPItem.Id,
            APPId = c.APPItem.APPId,
            PPMPItemId = c.APPItem.PPMPItemId,
            PPMPItemName = c.APPItem.PPMPItem != null ? c.APPItem.PPMPItem.Name : string.Empty,
            ProcurementModeId = c.APPItem.ProcurementModeId,
            ProcurementModeName = c.APPItem.ProcurementMode != null ? c.APPItem.ProcurementMode.Name : string.Empty,
            FundSourceId = c.APPItem.FundSourceId,
            FundSourceName = c.APPItem.FundSource != null ? c.APPItem.FundSource.Name : string.Empty,
            OfficeId = c.APPItem.OfficeId,
            OfficeName = c.APPItem.Office != null ? c.APPItem.Office.Name : string.Empty,
            PAPCode = c.APPItem.PAPCode,
            Remarks = c.APPItem.Remarks,
            IsEarlyProcurementActivity = c.APPItem.IsEarlyProcurementActivity,
            IsOutsourced = c.APPItem.IsOutsourced,
            BidEvaluationCriteria = c.APPItem.BidEvaluationCriteria,
            ProcurementStrategies = c.APPItem.ProcurementStrategies,
            CreatedAt = c.APPItem.CreatedAt,
            CreatedBy = c.APPItem.CreatedBy,
            UpdatedAt = c.APPItem.UpdatedAt,
            UpdatedBy = c.APPItem.UpdatedBy,
            EffectiveStartOfProcurement = c.APPItem.StartOfProcurementOverride ?? (c.APPItem.PPMPItem != null && c.APPItem.PPMPItem.ProcurementStartDate.HasValue ? c.APPItem.PPMPItem.ProcurementStartDate.Value.ToDateTime(TimeOnly.MinValue) : null),
            EffectiveEndOfProcurement = c.APPItem.EndOfProcurementOverride ?? (c.APPItem.PPMPItem != null && c.APPItem.PPMPItem.ProcurementEndDate.HasValue ? c.APPItem.PPMPItem.ProcurementEndDate.Value.ToDateTime(TimeOnly.MinValue) : null),
            StartOfProcurementOverride = c.APPItem.StartOfProcurementOverride,
            EndOfProcurementOverride = c.APPItem.EndOfProcurementOverride,
            EstimatedBudgetOverride = c.APPItem.EstimatedBudgetOverride,
            OriginalPPMPBudget = c.APPItem.OriginalPPMPBudget,
            EffectiveABC = c.APPItem.EffectiveABC,
            IsABCOverridden = c.APPItem.EstimatedBudgetOverride.HasValue,
            IsStartProcurementOverridden = c.APPItem.StartOfProcurementOverride.HasValue,
            IsEndProcurementOverridden = c.APPItem.EndOfProcurementOverride.HasValue,
            IsNew = c.APPItem.IsNew,
            IsRevised = c.APPItem.IsRevised,
            APP = c.APPItem.APP != null ? new APPItemAPPResponse
            {
                Id = c.APPItem.APP.Id,
                APPNumber = c.APPItem.APP.APPNumber,
                Name = c.APPItem.APP.Name
            } : null,
            PPMPItem = c.APPItem.PPMPItem != null ? new APPItemPPMPItemResponse
            {
                Id = c.APPItem.PPMPItem.Id,
                PAPCode = c.APPItem.PPMPItem.PAPCode,
                Name = c.APPItem.PPMPItem.Name,
                Description = c.APPItem.PPMPItem.Description,
                Unit = c.APPItem.PPMPItem.Unit,
                UnitPrice = c.APPItem.PPMPItem.UnitPrice
            } : null,
            ProcurementMode = c.APPItem.ProcurementMode != null ? new APPItemProcurementModeResponse
            {
                Id = c.APPItem.ProcurementMode.Id,
                Name = c.APPItem.ProcurementMode.Name,
                Description = c.APPItem.ProcurementMode.Description
            } : null,
            FundSource = c.APPItem.FundSource != null ? new APPItemFundSourceResponse
            {
                Id = c.APPItem.FundSource.Id,
                Name = c.APPItem.FundSource.Name,
                Code = c.APPItem.FundSource.Code
            } : null,
            Office = c.APPItem.Office != null ? new APPItemOfficeResponse
            {
                Id = c.APPItem.Office.Id,
                Name = c.APPItem.Office.Name,
                Code = c.APPItem.Office.Code
            } : null,
            Schedules = c.APPItem.PPMPItem != null && c.APPItem.PPMPItem.APPProcurementSchedules != null
                ? c.APPItem.PPMPItem.APPProcurementSchedules
                    .Where(schedule => !schedule.IsDeleted)
                    .Select(schedule => new APPItemScheduleReferenceResponse
                    {
                        Id = schedule.Id,
                        ProcurementActivityTypeId = schedule.ProcurementActivityTypeId,
                        ProcurementActivityTypeName = schedule.ProcurementActivityType != null ? schedule.ProcurementActivityType.Name : string.Empty,
                        ScheduledDate = schedule.ScheduledDate,
                        CustomDateText = schedule.CustomDateText
                    }).ToList()
                : new List<APPItemScheduleReferenceResponse>()
        } : null,
        ConsolidatedPR = c.ConsolidatedPR != null ? new ConsolidatedPRSummaryResponse
        {
            Id = c.ConsolidatedPR.Id,
            CPRNumber = c.ConsolidatedPR.CPRNumber,
            Description = c.ConsolidatedPR.Description ?? string.Empty,
            ModeOfProcurementId = c.ConsolidatedPR.ConsolidatedPRItems
                .Where(ci => ci.ProcurementModeId != null)
                .Select(ci => ci.ProcurementModeId)
                .FirstOrDefault(),
            ModeOfProcurementName = c.ConsolidatedPR.ConsolidatedPRItems
                .Where(ci => ci.ProcurementMode != null)
                .Select(ci => ci.ProcurementMode!.Name)
                .FirstOrDefault() ?? string.Empty
        } : null,
        ABC = c.ABC,
        Status = c.Status,
        ResolutionType = c.BACResolutions.Select(r => r.ResolutionType).FirstOrDefault(),
        ResolutionNumber = c.BACResolutions.Select(r => r.ResolutionNumber).FirstOrDefault(),
        DateResolved = c.BACResolutions.Select(r => (DateTime?)r.DateResolved).FirstOrDefault(),
        ResolvedLocation = c.BACResolutions.Select(r => r.ResolvedLocation).FirstOrDefault(),
        EndUserRepresentativeId = c.EndUserRepresentativeId,
        EndUserRepresentative = c.EndUserRepresentative != null ? new ProjectUserResponse
        {
            Id = c.EndUserRepresentative.Id,
            FirstName = c.EndUserRepresentative.FirstName,
            LastName = c.EndUserRepresentative.LastName,
            Email = c.EndUserRepresentative.Email
        } : null,
        TechRepresentativeId = c.TechRepresentativeId,
        TechRepresentative = c.TechRepresentative != null ? new ProjectUserResponse
        {
            Id = c.TechRepresentative.Id,
            FirstName = c.TechRepresentative.FirstName,
            LastName = c.TechRepresentative.LastName,
            Email = c.TechRepresentative.Email
        } : null,
        ApprovalAttachmentFileId = c.ApprovalAttachmentFileId,
        BACResolutions = c.BACResolutions.Select(r => new BACResolutionResponse
        {
            Id = r.Id,
            ProcurementProjectId = r.ProcurementProjectId,
            ResolutionType = r.ResolutionType,
            ResolutionNumber = r.ResolutionNumber,
            DateResolved = r.DateResolved,
            ResolvedLocation = r.ResolvedLocation,
            Status = r.Status,
            WhereasClauses = r.WhereasClauseItems != null
                ? r.WhereasClauseItems
                    .OrderBy(item => item.Order)
                    .Select(item => new BACResolutionWhereasClauseItemResponse
                    {
                        Id = item.BACResolutionWhereasClause != null ? item.BACResolutionWhereasClause.Id : item.BACResolutionWhereasClauseId,
                        Name = item.BACResolutionWhereasClause != null ? item.BACResolutionWhereasClause.Name : string.Empty,
                        Body = item.BACResolutionWhereasClause != null ? item.BACResolutionWhereasClause.Body : string.Empty,
                        Order = item.Order
                    }).ToList()
                : new List<BACResolutionWhereasClauseItemResponse>(),
            ClauseLinks = r.ClauseLinks != null
                ? r.ClauseLinks
                    .OrderBy(item => item.Order)
                    .Select(item => new BACResolutionClauseLinkResponse
                    {
                        Id = item.Id,
                        ResolutionClauseId = item.ResolutionClauseId,
                        Name = item.ResolutionClause != null ? item.ResolutionClause.Name : string.Empty,
                        Body = item.ResolutionClause != null ? item.ResolutionClause.Body : string.Empty,
                        ClauseType = item.ClauseType,
                        Order = item.Order
                    }).ToList()
                : new List<BACResolutionClauseLinkResponse>(),
            BiddingActivitySchedules = c.BiddingActivitySchedules.Select(s => new BiddingActivityScheduleResponse
            {
                Id = s.Id,
                ProcurementProjectId = s.ProcurementProjectId,
                ProcurementActivityTypeId = s.ProcurementActivityTypeId,
                ProcurementActivityTypeName = s.ProcurementActivityType != null ? s.ProcurementActivityType.Name : string.Empty,
                StartDate = s.StartDate,
                EndDate = s.EndDate,
                Venue = s.Venue,
                Status = s.Status,
                Remarks = s.Remarks
            }).ToList(),
            EndUserRepresentativeId = c.EndUserRepresentativeId,
            EndUserRepresentative = c.EndUserRepresentative != null ? new ProjectUserResponse
            {
                Id = c.EndUserRepresentative.Id,
                FirstName = c.EndUserRepresentative.FirstName,
                LastName = c.EndUserRepresentative.LastName,
                Email = c.EndUserRepresentative.Email
            } : null,
            TechRepresentativeId = c.TechRepresentativeId,
            TechRepresentative = c.TechRepresentative != null ? new ProjectUserResponse
            {
                Id = c.TechRepresentative.Id,
                FirstName = c.TechRepresentative.FirstName,
                LastName = c.TechRepresentative.LastName,
                Email = c.TechRepresentative.Email
            } : null
        }).ToList(),
        BiddingActivitySchedules = c.BiddingActivitySchedules.Select(s => new BiddingActivityScheduleResponse
        {
            Id = s.Id,
            ProcurementProjectId = s.ProcurementProjectId,
            ProcurementActivityTypeId = s.ProcurementActivityTypeId,
            ProcurementActivityTypeName = s.ProcurementActivityType != null ? s.ProcurementActivityType.Name : string.Empty,
            StartDate = s.StartDate,
            EndDate = s.EndDate,
            Venue = s.Venue,
            Status = s.Status,
            Remarks = s.Remarks
        }).ToList()
    };
}


public record WhereasClauseItemResponse
{
    public Guid WhereasClauseId { get; init; }
    public int Order { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Body { get; init; } = string.Empty;
}

public record ConsolidatedPRSummaryResponse
{
    public Guid Id { get; init; }
    public string CPRNumber { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public Guid? ModeOfProcurementId { get; init; }
    public string ModeOfProcurementName { get; init; } = string.Empty;
}

public record ProjectUserResponse
{
    public Guid Id { get; init; }
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
}
