using System;
using System.Collections.Generic;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Dtos;

public record DirectContractingResponse
{
    public Guid Id { get; init; }
    public string DCNumber { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public Guid BACProjectId { get; init; }
    public string BACProjectTitle { get; init; } = string.Empty;
    public decimal BACProjectABC { get; init; }
    public string BACProjectStatus { get; init; } = string.Empty;
    
    public Guid ExclusiveSupplierId { get; init; }
    public string ExclusiveSupplierName { get; init; } = string.Empty;
    public string ExclusiveSupplierEmail { get; init; } = string.Empty;
    public string ExclusiveSupplierContact { get; init; } = string.Empty;
    public string ExclusiveSupplierPhilGEPS { get; init; } = string.Empty;
    
    public DateTime SubmissionDeadline { get; init; }
    public string Status { get; init; } = string.Empty;
    public decimal TotalABC { get; init; }
    public string? ReviewRemarks { get; init; }
    public Guid? CreatedByUserId { get; init; }
    public Guid? ReviewedByUserId { get; init; }
    public DateTime CreatedAt { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DirectContractingProposalResponse? Proposal { get; init; }
}

public record DirectContractingProposalResponse
{
    public Guid Id { get; init; }
    public Guid DirectContractingId { get; init; }
    public Guid SupplierId { get; init; }
    public string SupplierName { get; init; } = string.Empty;
    public string ExclusivityDocumentUrl { get; init; } = string.Empty;
    public string? ProposalRemarks { get; init; }
    public decimal TotalProposalAmount { get; init; }
    public DateTime SubmittedAt { get; init; }
    public List<DirectContractingProposalItemResponse> ProposalItems { get; init; } = [];
}

public record DirectContractingProposalItemResponse
{
    public Guid Id { get; init; }
    public Guid ProposalId { get; init; }
    public Guid CPRItemId { get; init; }
    public string CPRItemName { get; init; } = string.Empty;
    public decimal UnitABC { get; init; }
    public decimal TotalABC { get; init; }
    public decimal UnitBid { get; init; }
    public decimal TotalBid { get; init; }
    public string? Brand { get; init; }
    public string? Model { get; init; }
    public string? Color { get; init; }
    public string? BrochureFileUrl { get; init; }
}
