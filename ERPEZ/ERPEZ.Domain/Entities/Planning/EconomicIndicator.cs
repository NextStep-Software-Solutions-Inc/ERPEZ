using ERPEZ.Domain.Common;
using Sieve.Attributes;

namespace ERPEZ.Domain.Entities.Planning;

/// <summary>
/// Represents economic indicators (VAT, Inflation, Income Tax) per Fiscal Year.
/// </summary>
public class EconomicIndicator : BaseEntity
{
    [Sieve(CanFilter = true, CanSort = true)]
    public Guid FiscalYearId { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal VATRate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal InflationRate { get; set; }

    [Sieve(CanFilter = true, CanSort = true)]
    public decimal IncomeTaxRate { get; set; }

    // Navigation Properties
    public virtual FiscalYear? FiscalYear { get; set; }
}
