using ERPEZ.Domain.Entities.Planning;
using Sieve.Services;

namespace ERPEZ.Application.Common.Sieve;

/// <summary>
/// Sieve mappings for planning feature entities.
/// </summary>
public class PlanningSieveConfiguration : ISieveConfiguration
{
    public void Configure(SievePropertyMapper mapper)
    {
        mapper.Property<DUAllocation>(allocation => allocation.DeliveryUnit.ParentId)
            .CanFilter()
            .CanSort()
            .HasName("deliveryUnit.parentId")
            .HasName("parentId")
            .HasName("ParentId");
        
        mapper.Property<DUFundAllocation>(allocation => allocation.ReceivedFund.FundSourceId)
            .CanFilter()
            .CanSort()
            .HasName("receivedFund.fundSourceId")
            .HasName("fundSourceId")
            .HasName("FundSourceId");
    }
}
