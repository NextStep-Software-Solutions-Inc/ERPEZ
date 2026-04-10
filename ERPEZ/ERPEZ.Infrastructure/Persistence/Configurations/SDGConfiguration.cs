using ERPEZ.Domain.Entities.Planning;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERPEZ.Infrastructure.Persistence.Configurations;

public class SDGConfiguration : IEntityTypeConfiguration<SDG>
{
    public void Configure(EntityTypeBuilder<SDG> builder)
    {
        builder.Property(e => e.Name)
            .IsRequired()
            .HasMaxLength(200);
        
        builder.Property(e => e.Description)
            .HasMaxLength(1000);
        
        builder.HasIndex(e => e.Name)
            .IsUnique();

        var seedCreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        // Seed the 17 Sustainable Development Goals
        var seedData = new List<SDG>
        {
            new SDG
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000001"),
                Name = "Goal 1: No Poverty",
                Description = "End poverty in all its forms everywhere.",
                CreatedAt = seedCreatedAt,
                CreatedBy = "System",
                IsDeleted = false
            },
            new SDG
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000002"),
                Name = "Goal 2: Zero Hunger",
                Description = "End hunger, achieve food security, and promote sustainable agriculture.",
                CreatedAt = seedCreatedAt,
                CreatedBy = "System",
                IsDeleted = false
            },
            new SDG
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000003"),
                Name = "Goal 3: Good Health and Well-being",
                Description = "Ensure healthy lives and promote well-being for all.",
                CreatedAt = seedCreatedAt,
                CreatedBy = "System",
                IsDeleted = false
            },
            new SDG
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000004"),
                Name = "Goal 4: Quality Education",
                Description = "Ensure inclusive and equitable quality education for all.",
                CreatedAt = seedCreatedAt,
                CreatedBy = "System",
                IsDeleted = false
            },
            new SDG
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000005"),
                Name = "Goal 5: Gender Equality",
                Description = "Achieve gender equality and empower all women and girls.",
                CreatedAt = seedCreatedAt,
                CreatedBy = "System",
                IsDeleted = false
            },
            new SDG
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000006"),
                Name = "Goal 6: Clean Water and Sanitation",
                Description = "Ensure availability and sustainable management of water.",
                CreatedAt = seedCreatedAt,
                CreatedBy = "System",
                IsDeleted = false
            },
            new SDG
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000007"),
                Name = "Goal 7: Affordable and Clean Energy",
                Description = "Ensure access to affordable, reliable, and sustainable energy.",
                CreatedAt = seedCreatedAt,
                CreatedBy = "System",
                IsDeleted = false
            },
            new SDG
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000008"),
                Name = "Goal 8: Decent Work and Economic Growth",
                Description = "Promote inclusive economic growth and decent work for all.",
                CreatedAt = seedCreatedAt,
                CreatedBy = "System",
                IsDeleted = false
            },
            new SDG
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000009"),
                Name = "Goal 9: Industry, Innovation and Infrastructure",
                Description = "Build resilient infrastructure and foster innovation.",
                CreatedAt = seedCreatedAt,
                CreatedBy = "System",
                IsDeleted = false
            },
            new SDG
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000010"),
                Name = "Goal 10: Reduced Inequalities",
                Description = "Reduce inequality within and among countries.",
                CreatedAt = seedCreatedAt,
                CreatedBy = "System",
                IsDeleted = false
            },
            new SDG
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000011"),
                Name = "Goal 11: Sustainable Cities and Communities",
                Description = "Make cities safe, resilient, and sustainable.",
                CreatedAt = seedCreatedAt,
                CreatedBy = "System",
                IsDeleted = false
            },
            new SDG
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000012"),
                Name = "Goal 12: Responsible Consumption and Production",
                Description = "Ensure sustainable consumption and production patterns.",
                CreatedAt = seedCreatedAt,
                CreatedBy = "System",
                IsDeleted = false
            },
            new SDG
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000013"),
                Name = "Goal 13: Climate Action",
                Description = "Take urgent action to combat climate change.",
                CreatedAt = seedCreatedAt,
                CreatedBy = "System",
                IsDeleted = false
            },
            new SDG
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000014"),
                Name = "Goal 14: Life Below Water",
                Description = "Conserve and sustainably use oceans, seas, and marine resources.",
                CreatedAt = seedCreatedAt,
                CreatedBy = "System",
                IsDeleted = false
            },
            new SDG
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000015"),
                Name = "Goal 15: Life on Land",
                Description = "Protect, restore, and promote sustainable terrestrial ecosystems.",
                CreatedAt = seedCreatedAt,
                CreatedBy = "System",
                IsDeleted = false
            },
            new SDG
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000016"),
                Name = "Goal 16: Peace, Justice and Strong Institutions",
                Description = "Promote peaceful societies and access to justice.",
                CreatedAt = seedCreatedAt,
                CreatedBy = "System",
                IsDeleted = false
            },
            new SDG
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000017"),
                Name = "Goal 17: Partnerships for the Goals",
                Description = "Strengthen global partnerships for sustainable development.",
                CreatedAt = seedCreatedAt,
                CreatedBy = "System",
                IsDeleted = false
            }
        };

        builder.HasData(seedData);
    }
}
