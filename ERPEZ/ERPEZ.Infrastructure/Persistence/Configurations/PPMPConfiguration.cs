using ERPEZ.Domain.Entities.Planning;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERPEZ.Infrastructure.Persistence.Configurations;

public class PPMPConfiguration : IEntityTypeConfiguration<PPMP>
{
    public void Configure(EntityTypeBuilder<PPMP> builder)
    {
        builder.Property(e => e.PPMPNumber)
            .IsRequired()
            .HasMaxLength(100);
        
        builder.Property(e => e.Status)
            .IsRequired()
            .HasMaxLength(50);
        
        builder.Property(e => e.Description)
            .HasMaxLength(1000);
        
        builder.Property(e => e.EndUser)
            .HasMaxLength(200);
        
        builder.HasIndex(e => e.PPMPNumber)
            .IsUnique();
        
        builder.HasIndex(e => new { e.DeliveryUnitId, e.FiscalYear });
        builder.HasIndex(e => e.IsFinal);
    }
}
