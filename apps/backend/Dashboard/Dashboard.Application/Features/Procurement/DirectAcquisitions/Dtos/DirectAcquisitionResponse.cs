using System;
using System.Collections.Generic;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Dtos;

public class DirectAcquisitionResponse
{
    public Guid Id { get; set; }
    public string DANumber { get; set; } = string.Empty;
    public Guid ConsolidatedPRId { get; set; }
    public string CPRNumber { get; set; } = string.Empty;
    public string? ConsolidatedPRDescription { get; set; }
    public Guid? BACProjectId { get; set; }
    public string? BACResolutionNumber { get; set; }
    public string Office { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string ModeOfProcurement { get; set; } = "Direct Acquisition";
    public decimal TotalABC { get; set; }
    public DirectAcquisitionStatusEnum Status { get; set; }
    public string? Remarks { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    public DirectPurchaseEntryResponse? PurchaseEntry { get; set; }
    public List<DirectAcquisitionDocumentResponse> Documents { get; set; } = [];
    public List<DirectAcquisitionCPRItemResponse> ConsolidatedPRItems { get; set; } = [];
    public List<Guid>? SelectedItemIds { get; set; }
}
