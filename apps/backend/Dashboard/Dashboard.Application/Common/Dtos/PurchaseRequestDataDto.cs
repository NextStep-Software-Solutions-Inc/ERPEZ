using System;
using System.Collections.Generic;
using ERPEZ.Application.Common.Interfaces;

namespace ERPEZ.Application.Common.Dtos;

public class PurchaseRequestDataDto : IAgencyLetterheadAware
{
    public Guid OfficeId { get; set; }
    public string? ProcuringEntityName { get; set; }
    public string? ProcuringEntityAddress { get; set; }
    public byte[]? LogoBytes { get; set; }
    public string? LetterheadAlignment { get; set; }

    public string EntityName
    {
        get => ProcuringEntityName ?? string.Empty;
        set => ProcuringEntityName = value;
    }

    public string FundCluster { get; set; } = string.Empty;
    public string UacsCode { get; set; } = string.Empty;
    public string OfficeSection { get; set; } = string.Empty;
    public string PRNumber { get; set; } = string.Empty;
    public DateOnly? Date { get; set; }
    public string ResponsibilityCenterCode { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Purpose { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public List<PurchaseRequestItemRowDto> Items { get; set; } = [];
    public List<SignatoryDto> Signatories { get; set; } = [];
}

public class PurchaseRequestItemRowDto
{
    public int ItemNo { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal UnitCost { get; set; }
    public decimal TotalCost { get; set; }
}
