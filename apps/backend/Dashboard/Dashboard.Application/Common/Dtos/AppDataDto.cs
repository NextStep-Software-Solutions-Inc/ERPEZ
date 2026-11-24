using System;
using System.Collections.Generic;

namespace ERPEZ.Application.Common.Dtos;

public class AppDataDto : ERPEZ.Application.Common.Interfaces.IAgencyLetterheadAware
{
    public string? ProcuringEntityName { get; set; }
    public string? ProcuringEntityAddress { get; set; }
    public byte[]? LogoBytes { get; set; }
    public string? LetterheadAlignment { get; set; }

    public string APPNumber { get; set; } = string.Empty;
    public string FiscalYear { get; set; } = string.Empty;
    public string Batch { get; set; } = string.Empty;
    public string Quarter { get; set; } = string.Empty;
    public bool IsIndicative { get; set; }
    public bool IsFinal { get; set; }
    public bool IsUpdated { get; set; }
    public string VersionNumber { get; set; } = string.Empty;
    public string VersionDate { get; set; } = string.Empty;
    public List<AppItemRowDto> GeneralRequirements { get; set; } = [];
    public List<AppItemRowDto> CommonUseSupplies { get; set; } = [];
    public List<AppItemRowDto> MiscellaneousItems { get; set; } = [];
    public decimal TotalEpaProjects { get; set; }
    public decimal TotalCsePsDbm { get; set; }
    public decimal TotalEstimatedBudget { get; set; }
    public List<SignatoryDto> Signatories { get; set; } = [];
}

public class AppItemRowDto
{
    public string ProjectTitle { get; set; } = string.Empty;
    public string EndUserOrImplementingUnit { get; set; } = string.Empty;
    public string GeneralDescription { get; set; } = string.Empty;
    public string ModeOfProcurement { get; set; } = string.Empty;
    public bool CoveredByEpa { get; set; }
    public string CriteriaForBidEvaluation { get; set; } = string.Empty;
    public string StartOfProcurement { get; set; } = string.Empty;
    public string EndOfProcurement { get; set; } = string.Empty;
    public string SourceOfFund { get; set; } = string.Empty;
    public decimal EstimatedBudget { get; set; }
    public string ProcurementStrategyOrTools { get; set; } = string.Empty;
    public string Remarks { get; set; } = string.Empty;
    public bool IsNew { get; set; }
    public bool IsRevised { get; set; }
}
