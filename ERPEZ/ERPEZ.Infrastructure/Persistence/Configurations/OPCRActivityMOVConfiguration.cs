using ERPEZ.Domain.Entities.Performance;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERPEZ.Infrastructure.Persistence.Configurations;

public class OPCRActivityMOVConfiguration : IEntityTypeConfiguration<OPCRActivityMOV>
{
    public void Configure(EntityTypeBuilder<OPCRActivityMOV> builder)
    {
        builder.Property(e => e.FileName)
            .IsRequired()
            .HasMaxLength(500);
        
        builder.Property(e => e.Url)
            .HasMaxLength(1000);
        
        builder.HasIndex(e => e.OPCRActivityId);
        builder.HasIndex(e => e.UploadedDate);
    }
}
