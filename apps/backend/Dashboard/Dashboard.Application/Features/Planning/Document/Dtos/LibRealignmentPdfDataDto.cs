using ERPEZ.Application.Common.Interfaces;

namespace ERPEZ.Application.Features.Planning.Document.Dtos;

public class LibRealignmentPdfDataDto : IAgencyLetterheadAware
{
    public string? ProcuringEntityName { get; set; }
    public string? ProcuringEntityAddress { get; set; }
    public byte[]? LogoBytes { get; set; }

    // Document Metadata
    public string DocumentCode { get; set; } = "FM-SUC-FDP-002";
    public string RevisionNo { get; set; } = "00";
    public string EffectiveDate { get; set; } = "04.01.22";
    public string FiscalYear { get; set; } = string.Empty;
    public string? OrganizationName { get; set; }
    public string? AgencyName { get; set; }
    public string DeliveryUnit { get; set; } = string.Empty;

    // Part 1: Reason for Modification of Budget
    public string ReasonKey { get; set; } = string.Empty;
    public string Justification { get; set; } = string.Empty;

    // Part 2: Approved Line-Item Budget to be Modified
    public LibRealignmentPart2Dto Part2ApprovedBudget { get; set; } = new();

    // Part 3: Proposed Modification
    public LibRealignmentPart3Dto Part3ProposedModification { get; set; } = new();

    // Signatories (4 sequential approval roles)
    public List<LibRealignmentSignatoryDto> Signatories { get; set; } = [];
}

public class LibRealignmentPart2Dto
{
    public string Goal { get; set; } = string.Empty;
    public string PrexcCodeAndTitle { get; set; } = string.Empty;
    public List<LibRealignmentActivityDto> Activities { get; set; } = [];
    public decimal TotalQ1 { get; set; }
    public decimal TotalQ2 { get; set; }
    public decimal TotalQ3 { get; set; }
    public decimal TotalQ4 { get; set; }
    public decimal GrandTotal { get; set; }
}

public class LibRealignmentPart3Dto
{
    public string Goal { get; set; } = string.Empty;
    public string PrexcCodeAndTitle { get; set; } = string.Empty;
    public string TargetActivityName { get; set; } = string.Empty;
    public List<LibRealignmentActivityDto> Activities { get; set; } = [];
    public List<LibRealignmentItemRowDto> Items { get; set; } = [];
    public decimal TotalQ1 { get; set; }
    public decimal TotalQ2 { get; set; }
    public decimal TotalQ3 { get; set; }
    public decimal TotalQ4 { get; set; }
    public decimal ProposedGrandTotal { get; set; }
}

public class LibRealignmentActivityDto
{
    public string ActivityName { get; set; } = string.Empty;
    public List<LibRealignmentItemRowDto> Items { get; set; } = [];
    public decimal SubTotalQ1 { get; set; }
    public decimal SubTotalQ2 { get; set; }
    public decimal SubTotalQ3 { get; set; }
    public decimal SubTotalQ4 { get; set; }
    public decimal SubTotal { get; set; }
}

public class LibRealignmentItemRowDto
{
    public string ItemOfExpenditure { get; set; } = string.Empty;
    public decimal Q1 { get; set; }
    public decimal Q2 { get; set; }
    public decimal Q3 { get; set; }
    public decimal Q4 { get; set; }
    public decimal Total { get; set; }
}

public class LibRealignmentSignatoryDto
{
    public string Role { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public int Order { get; set; }
}
