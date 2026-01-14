using ERPEZ.Domain.Entities.Planning;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERPEZ.Infrastructure.Persistence.Configurations;

public class PPMPItemAllocationConfiguration : IEntityTypeConfiguration<PPMPItemAllocation>
{
    public void Configure(EntityTypeBuilder<PPMPItemAllocation> builder)
    {
        builder.HasIndex(e => e.PPMPItemId);
        builder.HasIndex(e => new { e.StartDate, e.EndDate });
    }
}
