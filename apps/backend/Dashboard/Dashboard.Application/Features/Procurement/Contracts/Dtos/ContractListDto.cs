using System;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.Contracts.Dtos;

/// <summary>
/// Flat DTO for tabular contract listing.
/// Normalization Invariant: Supplier, Project, and Total Amount are projected
/// dynamically through the linked NoticeOfAward rather than persisted columns.
/// </summary>
public record ContractListDto
{
    public Guid Id { get; init; }
    public string ContractNumber { get; init; } = string.Empty;
    public Guid NoticeOfAwardId { get; init; }
    public string NOANumber { get; init; } = string.Empty;
    public DateOnly ContractDate { get; init; }
    public string Description { get; init; } = string.Empty;
    public ContractStatus Status { get; init; }

    // Authoritative derived fields from NoticeOfAward (normalized)
    public Guid SupplierId { get; init; }
    public string SupplierName { get; init; } = string.Empty;
    public Guid ProcurementProjectId { get; init; }
    public string ProjectTitle { get; init; } = string.Empty;
    public decimal TotalAmount { get; init; }

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
    public DateTime? UpdatedAt { get; init; }
}
