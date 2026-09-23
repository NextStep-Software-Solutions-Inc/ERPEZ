using System;
using System.Collections.Generic;
using ERPEZ.Application.Features.Procurement.NoticeOfAwards.Dtos;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.Contracts.Dtos;

/// <summary>
/// Detailed DTO for full Contract view.
/// Normalization Invariant: Supplier, Project, and Total Amount are projected
/// dynamically through the linked NoticeOfAward rather than persisted columns.
/// </summary>
public record ContractDetailDto
{
    public Guid Id { get; init; }
    public string ContractNumber { get; init; } = string.Empty;
    public Guid NoticeOfAwardId { get; init; }
    public string NOANumber { get; init; } = string.Empty;
    public DateOnly NOADate { get; init; }
    public DateOnly ContractDate { get; init; }
    public string Description { get; init; } = string.Empty;
    public ContractStatus Status { get; init; }

    // Projected Supplier Details
    public Guid SupplierId { get; init; }
    public string SupplierName { get; init; } = string.Empty;
    public string? SupplierAddress { get; init; }
    public string? SupplierContactPerson { get; init; }
    public string? SupplierEmail { get; init; }
    public string? SupplierContactNumber { get; init; }

    // Projected Project Details
    public Guid ProcurementProjectId { get; init; }
    public string ProjectTitle { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }
    public string ModeOfProcurement { get; init; } = string.Empty;
    public string? BACResolutionNumber { get; init; }

    // Line items derived from Project / ConsolidatedPR / APP
    public List<AwardedLineItemDto> LineItems { get; init; } = [];

    // Milestones from linked NoticeOfAward
    public List<NoticeOfAwardMilestoneDto> Milestones { get; init; } = [];

    // Internal review & approval audit fields
    public Guid? SubmittedById { get; init; }
    public DateTime? SubmittedAt { get; init; }
    public Guid? ApprovedById { get; init; }
    public string? ApprovedByName { get; init; }
    public DateTime? ApprovedAt { get; init; }
    public string? ApprovalRemarks { get; init; }
    public string? ReturnRemarks { get; init; }
    public Guid? ReturnedById { get; init; }
    public DateTime? ReturnedAt { get; init; }

    // Bilateral execution & statutory approval fields
    public DateOnly? ExecutedAt { get; init; }
    public Guid? ExecutedById { get; init; }
    public string? ExecutedByName { get; init; }
    public DateOnly? ContractApprovedAt { get; init; }
    public Guid? SignedContractFileId { get; init; }
    public string? SignedContractFileName { get; init; }
    public string? LateExecutionJustification { get; init; }
    public DateTime? JustificationLoggedAt { get; init; }

    public DateTime CreatedAt { get; init; }
    public string? CreatedBy { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public string? UpdatedBy { get; init; }
}
