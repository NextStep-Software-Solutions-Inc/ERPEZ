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