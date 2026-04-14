using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;

namespace ERPEZ.Application.Features.Planning.Budgeting.AgencyMasterBudget.Dtos;

public record AgencyMasterBudgetResponse
{
    public Guid Id { get; init; }
    public Guid FiscalYearId { get; init; }
    public Guid FundClusterId { get; init; }
    public SourceDocumentTypeEnum SourceDocumentType { get; init; }
    public decimal PSAmount { get; init; }
    public decimal MOOEAmount { get; init; }
    public decimal COAmount { get; init; }
}

public record CreateAgencyMasterBudgetRequest
{
    public Guid FiscalYearId { get; init; }
    public Guid FundClusterId { get; init; }
    public SourceDocumentTypeEnum SourceDocumentType { get; init; }
    public decimal PSAmount { get; init; }
    public decimal MOOEAmount { get; init; }
    public decimal COAmount { get; init; }
}

public record UpdateAgencyMasterBudgetRequest
{
    public Guid Id { get; init; }
    public Guid FiscalYearId { get; init; }
    public Guid FundClusterId { get; init; }
    public SourceDocumentTypeEnum SourceDocumentType { get; init; }
    public decimal PSAmount { get; init; }
    public decimal MOOEAmount { get; init; }
    public decimal COAmount { get; init; }
}