using ERPEZ.Domain.Entities.Planning;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERPEZ.Infrastructure.Persistence.Configurations;

public class APPProcurementScheduleConfiguration : IEntityTypeConfiguration<APPProcurementSchedule>
{
    public void Configure(EntityTypeBuilder<APPProcurementSchedule> builder)
    {
        builder.HasIndex(e => e.PPMPItemId);
        builder.HasIndex(e => e.ProcurementActivityTypeId);
        builder.HasIndex(e => e.ScheduledDate);
    }
}
