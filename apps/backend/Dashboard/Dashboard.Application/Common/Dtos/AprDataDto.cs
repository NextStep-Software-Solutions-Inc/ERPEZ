using System;
using System.Collections.Generic;
using ERPEZ.Domain.Enums;

namespace ERPEZ.Application.Common.Dtos;

public class AprDataDto : ERPEZ.Application.Common.Interfaces.IAgencyLetterheadAware
{
    public Guid OfficeId { get; set; }

    public string? ProcuringEntityName
    {
        get => RequestingAgencyName;
        set => RequestingAgencyName = value ?? string.Empty;
    }

    public string? ProcuringEntityAddress
    {
        get => RequestingAgencyAddress;
        set => RequestingAgencyAddress = value ?? string.Empty;
    }

    public byte[]? LogoBytes { get; set; }
    public string? LetterheadAlignment { get; set; }

    public string RequestingAgencyName { get; set; } = string.Empty;
    public string RequestingAgencyAddress { get; set; } = string.Empty;
    public string TelNos { get; set; } = string.Empty;
    public string AgencyAccountCode { get; set; } = string.Empty;
    public string AgencyControlNumber { get; set; } = string.Empty;

    public string PSAprNumber { get; set; } = string.Empty;
    public string To { get; set; } = "PS-DBM";
    public DateOnly? DatePrepared { get; set; }

    // Action requested: Common-use supplies
    public bool IsCommonUseSupplies { get; set; } = true;
    public string PriceListNumber { get; set; } = string.Empty;
    public string PriceListDate { get; set; } = string.Empty;

    // Delivery mode
    public APRModeOfDelivery ModeOfDelivery { get; set; } = APRModeOfDelivery.FastLane;

    // Insufficient funds
    public APRInsufficientFundsAction InsufficientFundsAction { get; set; } = APRInsufficientFundsAction.ReduceQuantity;
    public string ChargeToUnutilizedDepositAprNumber { get; set; } = string.Empty;
    public string ChargeToUnutilizedDepositDate { get; set; } = string.Empty;

    // Action requested: Non-common items
    public bool IsNonCommonItems { get; set; } = false;
    public bool RequiresCompleteSpecifications { get; set; } = false;
    public bool RequiresObR { get; set; } = false;
    public bool RequiresCBA { get; set; } = false;
    public bool RequiresPayment { get; set; } = false;
    public string OthersSpecify { get; set; } = string.Empty;

    // Items
    public List<AprItemRowDto> Items { get; set; } = [];
    public decimal TotalAmount { get; set; }

    // Signatories (3 blocks)
    public SignatoryDto PropertyOfficer { get; set; } = new()
    {
        Label = "STOCKS REQUESTED ARE CERTIFIED TO BE WITHIN APPROVED PROGRAM:",
        Position = "AGENCY PROPERTY/SUPPLY OFFICER"
    };

    public SignatoryDto ChiefAccountant { get; set; } = new()
    {
        Label = "FUNDS CERTIFIED AVAILABLE:",
        Position = "AGENCY CHIEF ACCOUNTANT"
    };

    public SignatoryDto ApprovedBy { get; set; } = new()
    {
        Label = "APPROVED:",
        Position = "AGENCY HEAD/AUTHORIZED SIGNATURE"
    };

    // Bottom check/deposit info
    public bool FundsDepositedWithPs { get; set; } = false;
    public bool CheckEnclosed { get; set; } = false;
    public string CheckDetails { get; set; } = string.Empty;
    public string CheckNumber { get; set; } = string.Empty;
    public decimal? CheckAmount { get; set; }
}

public class AprItemRowDto
{
    public int ItemNo { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public decimal Amount { get; set; }
}
