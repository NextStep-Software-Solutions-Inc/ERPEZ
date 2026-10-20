using ERPEZ.Application.Common.Interfaces;

namespace ERPEZ.Application.Common.Dtos;

public class PpmpDataDto : IAgencyLetterheadAware
{
    public string?            ProcuringEntityName { get; set; }
    public string?            ProcuringEntityAddress { get; set; }
    public byte[]?            LogoBytes   { get; set; }
    public string?            LetterheadAlignment { get; set; }

    public Guid               OfficeId    { get; set; }   // ← was AgencyId
    public string             PpmpNumber  { get; set; } = string.Empty;
    public string             FiscalYear  { get; set; } = string.Empty;
    public string             EndUserUnit { get; set; } = string.Empty;
    public bool               IsFinal     { get; set; }
    public bool               IsSupplemental { get; set; }
    public string?            SourcePpmpNumber { get; set; }
    public int?               SupplementalNumber { get; set; }
    public decimal            TotalBudget { get; set; }
    public List<PpmpRowDto>   Rows        { get; set; } = [];
    public List<SignatoryDto> Signatories { get; set; } = [];
}

public class PpmpRowDto
{
    public string  GeneralDescription          { get; set; } = string.Empty;
    public string  ProjectType                 { get; set; } = string.Empty;
    public string  QuantityAndSize             { get; set; } = string.Empty;
    public string  ProcurementMode             { get; set; } = string.Empty;
    public string  PreProcurementConference    { get; set; } = string.Empty;
    public string  StartOfProcurement          { get; set; } = string.Empty;
    public string  EndOfProcurement            { get; set; } = string.Empty;
    public string  ExpectedDeliveryPeriod      { get; set; } = string.Empty;
    public string  SourceOfFunds               { get; set; } = string.Empty;
    public decimal EstimatedBudget             { get; set; }
    public string  AttachedSupportingDocuments { get; set; } = string.Empty;
    public string  Remarks                     { get; set; } = string.Empty;
}