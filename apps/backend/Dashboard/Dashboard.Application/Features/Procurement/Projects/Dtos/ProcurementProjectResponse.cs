using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
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
    public ConsolidatedPRSummaryResponse? ConsolidatedPR { get; init; }
    public decimal ABC { get; init; }
    public string Status { get; init; } = string.Empty;

    // Top-level flattened resolution properties
    public string? ResolutionType { get; init; }
    public string? ResolutionNumber { get; init; }
    public DateTime? DateResolved { get; init; }
    public string? ResolvedLocation { get; init; }
    public List<WhereasClauseItemResponse> WhereasClauses { get; init; } = [];

    public List<BACResolutionResponse> BACResolutions { get; init; } = [];
    public List<BiddingActivityScheduleResponse> BiddingActivitySchedules { get; init; } = [];
    public Guid? EndUserRepresentativeId { get; init; }
    public ProjectUserResponse? EndUserRepresentative { get; init; }
    public Guid? TechRepresentativeId { get; init; }
    public ProjectUserResponse? TechRepresentative { get; init; }
    public Guid? ApprovalAttachmentFileId { get; init; }

    public static Expression<Func<ProcurementProject, ProcurementProjectResponse>> Projection => c => new ProcurementProjectResponse
    {
        Id = c.Id,
        SourceType = c.SourceType,
        APPItemId = c.APPItemId,
        ConsolidatedPRId = c.ConsolidatedPRId,
        Title = c.Title,
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
        WhereasClauses = c.BACResolutions.SelectMany(r => r.WhereasClauseItems)
            .OrderBy(item => item.Order)
            .Select(item => new WhereasClauseItemResponse
            {
                WhereasClauseId = item.BACResolutionWhereasClause.Id,
                Order = item.Order,
                Name = item.BACResolutionWhereasClause.Name,
                Body = item.BACResolutionWhereasClause.Body
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
            WhereasClause = r.WhereasClause,
            WhereasClauses = r.WhereasClauseItems
                .OrderBy(item => item.Order)
                .Select(item => new BACResolutionWhereasClauseResponse
                {
                    Id = item.BACResolutionWhereasClause.Id,
                    Name = item.BACResolutionWhereasClause.Name,
                    Body = item.BACResolutionWhereasClause.Body
                }).ToList()
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
