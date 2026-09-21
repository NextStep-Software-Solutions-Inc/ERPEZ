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

        mapper.Property<Domain.Entities.Planning.Object>(p => p.Name)
            .CanSort()
            .CanFilter();

        mapper.Property<Domain.Entities.Planning.Object>(p => p.Code)
            .CanSort()
            .CanFilter();

        mapper.Property<Domain.Entities.Planning.Object>(p => p.FiscalYearId)
            .CanSort()
            .CanFilter();

        mapper.Property<Domain.Entities.Planning.Object>(p => p.IsActive)
            .CanSort()
            .CanFilter();

        mapper.Property<Domain.Entities.Planning.Object>(p => p.ParentId)
            .CanSort()
            .CanFilter();

        mapper.Property<WFP>(p => p.ProjectStartDate.Year)
            .CanSort()
            .CanFilter()
            .HasName("fiscalYear");

        mapper.Property<WFP>(p => p.OPCR!.FiscalYearId)
            .CanSort()
            .CanFilter()
            .HasName("fiscalYearId");

        mapper.Property<OPCR>(p => p.Name)
            .CanSort()
            .CanFilter()
            .HasName("name");

        mapper.Property<OPCR>(p => p.FiscalYearId)
            .CanSort()
            .CanFilter()
            .HasName("fiscalYearId");

        mapper.Property<OPCR>(p => p.CommitmentStatus)
            .CanSort()
            .CanFilter()
            .HasName("commitmentStatus");

        mapper.Property<OPCR>(p => p.OfficeId)
            .CanSort()
            .CanFilter()
            .HasName("officeId");
    }
}
