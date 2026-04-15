using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;

namespace ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Dtos;

public record AgencyMasterBudgetResponse
{
    public Guid Id { get; init; }
    public Guid FiscalYearId { get; init; }
    public Guid FundSourceId { get; init; }
    public SourceDocumentTypeEnum SourceDocumentType { get; init; }
    public decimal PSAmount { get; init; }
    public decimal MOOEAmount { get; init; }
    public decimal COAmount { get; init; }
    public AgencyFiscalYearResponse? FiscalYear { get; init; }
    public AgencyFundSourceResponse? FundSource { get; init; }
    public List<AgencyOfficeCeilingResponse> OfficeCeilings { get; init; } = [];
}

public record AgencyFiscalYearResponse
{
    public Guid Id { get; init; }
    public int Year { get; init; }
    public string? Description { get; init; }
    public string Status { get; init; } = string.Empty;
    public bool IsLocked { get; init; }
    public DateTime? StartDate { get; init; }
    public DateTime? EndDate { get; init; }
}

public record AgencyFundSourceResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
    public bool IsActive { get; init; }
    public Guid? ParentId { get; init; }
    public string? ParentName { get; init; }
    public Guid? FiscalYearId { get; init; }
}

public record AgencyOfficeCeilingResponse
{
    public Guid Id { get; init; }
    public Guid FiscalYearId { get; init; }
    public Guid OfficeId { get; init; }
    public string OfficeName { get; init; } = string.Empty;
    public CeilingTargetTypeEnum TargetType { get; init; }
    public decimal PSAmount { get; init; }
    public decimal MOOEAmount { get; init; }
    public decimal COAmount { get; init; }
    public CeilingStatusEnum Status { get; init; }
    public bool IsSupplemental { get; init; }
    public int SubOfficeCeilingCount { get; init; }
}

public record CreateAgencyMasterBudgetRequest
{
    public Guid FiscalYearId { get; init; }
    public Guid FundSourceId { get; init; }
    public string SourceDocumentType { get; init; } = string.Empty;
    public decimal PSAmount { get; init; }
    public decimal MOOEAmount { get; init; }
    public decimal COAmount { get; init; }
}

public record UpdateAgencyMasterBudgetRequest
{
    public Guid FiscalYearId { get; init; }
    public Guid FundSourceId { get; init; }
    public string SourceDocumentType { get; init; } = string.Empty;
    public decimal PSAmount { get; init; }
    public decimal MOOEAmount { get; init; }
    public decimal COAmount { get; init; }
}