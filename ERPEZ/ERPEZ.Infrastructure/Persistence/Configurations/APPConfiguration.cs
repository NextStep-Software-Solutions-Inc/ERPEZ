using ERPEZ.Domain.Entities.Planning;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERPEZ.Infrastructure.Persistence.Configurations;

public class APPConfiguration : IEntityTypeConfiguration<APP>
{
    public void Configure(EntityTypeBuilder<APP> builder)
    {
        builder.Property(e => e.APPNumber)
            .IsRequired()
            .HasMaxLength(100);
        
        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(500);
        
        builder.Property(e => e.Status)
            .IsRequired()
            .HasMaxLength(50);
        
        builder.Property(e => e.IsFinal)
            .IsRequired()
            .HasMaxLength(50);
        
        builder.Property(e => e.Remarks)
            .HasMaxLength(1000);
        
        builder.Property(e => e.Description)
            .HasMaxLength(1000);
        
        // Foreign Key relationships
        builder.HasOne(e => e.FiscalYear)
            .WithMany()
            .HasForeignKey(e => e.FiscalYearId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.HasOne(e => e.Office)
            .WithMany()
            .HasForeignKey(e => e.OfficeId)
            .OnDelete(DeleteBehavior.Restrict);
        
        // Indexes
        builder.HasIndex(e => e.APPNumber)
            .IsUnique();
        
        builder.HasIndex(e => e.FiscalYearId);
        
        builder.HasIndex(e => e.OfficeId);
    }
}
