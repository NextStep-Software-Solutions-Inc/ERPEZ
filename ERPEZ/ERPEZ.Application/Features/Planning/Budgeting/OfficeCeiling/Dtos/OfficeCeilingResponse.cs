using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;

namespace ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Dtos;

public record OfficeCeilingResponse
{
    public Guid Id { get; init; }
    public Guid FiscalYearId { get; init; }
    public CeilingTargetTypeEnum TargetType { get; init; }
    public Guid OfficeId { get; init; }
    public Guid AgencyMasterBudgetId { get; init; }
    public decimal PSAmount { get; init; }
    public decimal MOOEAmount { get; init; }
    public decimal COAmount { get; init; }
    public CeilingStatusEnum Status { get; init; }
    public bool IsSupplemental { get; init; }
    public OfficeCeilingFiscalYearResponse? FiscalYear { get; init; }
    public OfficeCeilingOfficeResponse? Office { get; init; }
    public OfficeCeilingAgencyMasterBudgetResponse? AgencyMasterBudget { get; init; }
    public int SubOfficeCeilingCount { get; init; }
}

public record OfficeCeilingFiscalYearResponse
{
    public Guid Id { get; init; }
    public int Year { get; init; }
    public string? Description { get; init; }
}

public record OfficeCeilingOfficeResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
}

public record OfficeCeilingAgencyMasterBudgetResponse
{
    public Guid Id { get; init; }
    public SourceDocumentTypeEnum SourceDocumentType { get; init; }
    public Guid FundClusterId { get; init; }
    public Guid FiscalYearId { get; init; }
    public decimal PSAmount { get; init; }
    public decimal MOOEAmount { get; init; }
    public decimal COAmount { get; init; }
}

public record CreateOfficeCeilingRequest
{
    public Guid FiscalYearId { get; init; }
    public CeilingTargetTypeEnum TargetType { get; init; }
    public Guid OfficeId { get; init; }
    public Guid AgencyMasterBudgetId { get; init; }
    public decimal PSAmount { get; init; }
    public decimal MOOEAmount { get; init; }
    public decimal COAmount { get; init; }
    public CeilingStatusEnum Status { get; init; }
    public bool IsSupplemental { get; init; }
}

public record UpdateOfficeCeilingRequest
{
    public Guid Id { get; init; }
    public Guid FiscalYearId { get; init; }
    public CeilingTargetTypeEnum TargetType { get; init; }
    public Guid OfficeId { get; init; }
    public Guid AgencyMasterBudgetId { get; init; }
    public decimal PSAmount { get; init; }
    public decimal MOOEAmount { get; init; }
    public decimal COAmount { get; init; }
    public CeilingStatusEnum Status { get; init; }
    public bool IsSupplemental { get; init; }
}