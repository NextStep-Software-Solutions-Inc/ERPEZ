using ERPEZ.Domain.Entities.Procurement;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERPEZ.Infrastructure.Persistence.Configurations;

public class NonCSEItemConfiguration : IEntityTypeConfiguration<NonCSEItem>
{
    public void Configure(EntityTypeBuilder<NonCSEItem> builder)
    {
        builder.Property(e => e.BaseCost)
            .HasPrecision(18, 2)
            .IsRequired();
        
        builder.Property(e => e.Margin)
            .HasPrecision(18, 2)
            .IsRequired();
        
        builder.Property(e => e.SellingPrice)
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
        
        builder.Property(e => e.Type)
            .IsRequired()
            .HasMaxLength(100);
        
        builder.Property(e => e.Status)
            .IsRequired()
            .HasMaxLength(50);
        
        builder.HasIndex(e => e.Name);
        builder.HasIndex(e => e.Type);
        builder.HasIndex(e => e.Status);
        builder.HasIndex(e => e.IsActive);
    }
}
