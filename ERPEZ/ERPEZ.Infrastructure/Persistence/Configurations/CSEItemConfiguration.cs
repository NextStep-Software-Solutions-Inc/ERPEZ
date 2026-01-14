using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERPEZ.Infrastructure.Persistence.Configurations;

public class CSEItemConfiguration : IEntityTypeConfiguration<CSEItem>
{
    public void Configure(EntityTypeBuilder<CSEItem> builder)
    {
        builder.Property(e => e.Type)
            .HasConversion<string>()
            .IsRequired()
            .HasMaxLength(50);
        
        builder.Property(e => e.Price)
            .HasPrecision(18, 2)
            .IsRequired();
        
        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(500);
        
        builder.Property(e => e.Description)
            .HasMaxLength(1000);
        
        builder.Property(e => e.Unit)
            .IsRequired()
            .HasMaxLength(50);
        
        builder.Property(e => e.ProductCode)
            .HasMaxLength(100);
        
        builder.Property(e => e.ImageURL)
            .HasMaxLength(1000);
        
        builder.Property(e => e.Remarks)
            .HasMaxLength(1000);
        
        builder.HasIndex(e => e.Type);
        builder.HasIndex(e => e.ProductCode);
        builder.HasIndex(e => e.Name);
    }
}
