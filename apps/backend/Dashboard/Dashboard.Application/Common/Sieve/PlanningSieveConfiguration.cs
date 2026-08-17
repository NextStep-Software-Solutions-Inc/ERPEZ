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
        mapper.Property<FundSource>(p => p.Name)
            .CanSort()
            .CanFilter();

        mapper.Property<FundSource>(p => p.Code)
            .CanSort()
            .CanFilter();

        mapper.Property<FundSource>(p => p.Type)
            .CanSort()
            .CanFilter();

        mapper.Property<FundSource>(p => p.FiscalYearId)
            .CanSort()
            .CanFilter();
    }
}
