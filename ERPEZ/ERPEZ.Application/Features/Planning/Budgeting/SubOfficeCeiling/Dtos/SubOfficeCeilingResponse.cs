using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;

namespace ERPEZ.Application.Features.Planning.Budgeting.SubOfficeCeiling.Dtos;

public record SubOfficeCeilingResponse
{
    public Guid Id { get; init; }
    public Guid OfficeCeilingId { get; init; }
    public Guid SubOfficeId { get; init; }
    public Guid FundClusterId { get; init; }
    public Guid FiscalYearId { get; init; }
    public decimal PSAmount { get; init; }
    public decimal MOOEAmount { get; init; }
    public decimal COAmount { get; init; }
    public CeilingStatusEnum Status { get; init; }
}

public record CreateSubOfficeCeilingRequest
{
    public Guid OfficeCeilingId { get; init; }
    public Guid SubOfficeId { get; init; }
    public Guid FundClusterId { get; init; }
    public Guid FiscalYearId { get; init; }
    public decimal PSAmount { get; init; }
    public decimal MOOEAmount { get; init; }
    public decimal COAmount { get; init; }
    public CeilingStatusEnum Status { get; init; }
}

public record UpdateSubOfficeCeilingRequest
{
    public Guid Id { get; init; }
    public Guid OfficeCeilingId { get; init; }
    public Guid SubOfficeId { get; init; }
    public Guid FundClusterId { get; init; }
    public Guid FiscalYearId { get; init; }
    public decimal PSAmount { get; init; }
    public decimal MOOEAmount { get; init; }
    public decimal COAmount { get; init; }
    public CeilingStatusEnum Status { get; init; }
}