using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

public class Office : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public string Name { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Code { get; set; } = string.Empty;

    [Sieve(CanFilter = true, CanSort = true)]
    public string Address { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? ResponsibilityCenterCode { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public string? BudgetCostCenter { get; set; }

    // Foreign Keys
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OfficeTypeId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid OrganizationId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid CategoryId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid AdministrativeLevelId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ClusterId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ProcurementWorkflowId { get; set; }

    /// <summary>
    /// Self-referencing foreign key for office hierarchy.
    /// </summary>
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid? ParentId { get; set; }

    // Navigation Properties
    public virtual OfficeType OfficeType { get; set; } = null!;
    public virtual Organization Organization { get; set; } = null!;
    public virtual Category Category { get; set; } = null!;
    public virtual AdministrativeLevel AdministrativeLevel { get; set; } = null!;
    public virtual Cluster? Cluster { get; set; }
    public virtual ProcurementWorkflow? ProcurementWorkflow { get; set; }
    public virtual Office? Parent { get; set; }
    
    public virtual List<Office> Children { get; set; } = [];
    public virtual List<DeliveryUnit> DeliveryUnits { get; set; } = [];
    public virtual List<Position> Positions { get; set; } = [];
    public virtual List<WFP> WFPs { get; set; } = [];
}
