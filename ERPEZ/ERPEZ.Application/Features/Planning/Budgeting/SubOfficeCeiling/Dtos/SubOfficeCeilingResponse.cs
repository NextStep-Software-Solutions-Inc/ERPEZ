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
    public SubOfficeCeilingOfficeCeilingResponse? OfficeCeiling { get; init; }
    public SubOfficeCeilingOfficeResponse? SubOffice { get; init; }
    public SubOfficeCeilingFundClusterResponse? FundCluster { get; init; }
    public SubOfficeCeilingFiscalYearResponse? FiscalYear { get; init; }
}

public record SubOfficeCeilingOfficeCeilingResponse
{
    public Guid Id { get; init; }
    public Guid OfficeId { get; init; }
    public string OfficeName { get; init; } = string.Empty;
    public CeilingTargetTypeEnum TargetType { get; init; }
}

public record SubOfficeCeilingOfficeResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
}

public record SubOfficeCeilingFundClusterResponse
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Code { get; init; } = string.Empty;
    public string Type { get; init; } = string.Empty;
}

public record SubOfficeCeilingFiscalYearResponse
{
    public Guid Id { get; init; }
    public int Year { get; init; }
    public string? Description { get; init; }
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