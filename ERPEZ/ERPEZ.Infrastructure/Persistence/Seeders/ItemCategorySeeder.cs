using ERPEZ.Domain.Entities.Procurement;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace ERPEZ.Infrastructure.Persistence.Seeders;

public static class ItemCategorySeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (await context.ItemCategories!.AnyAsync()) return;

        var categories = new List<ItemCategory>
        {
            new() { Id = Guid.NewGuid(), Name = "Agricultural Machinery and Equipment", Description = "Machinery and equipment for agriculture" },
            new() { Id = Guid.NewGuid(), Name = "Arts and Crafts Equipment and Accessories and Supplies", Description = "Art supplies and crafts" },
            new() { Id = Guid.NewGuid(), Name = "Audio and Visual Equipment and Supplies", Description = "Audio/visual equipment" },
            new() { Id = Guid.NewGuid(), Name = "Cleaning Equipment and Supplies", Description = "Janitorial and cleaning supplies" },
            new() { Id = Guid.NewGuid(), Name = "Colors and Finishes", Description = "Paints, colors, and finishes" },
            new() { Id = Guid.NewGuid(), Name = "Furniture and Furnishings", Description = "Office and general furniture" },
            new() { Id = Guid.NewGuid(), Name = "Hardware and Construction Supplies", Description = "Construction materials" },
            new() { Id = Guid.NewGuid(), Name = "Information and Communication Technology (ICT) Equipment and Devices and Accessories", Description = "IT supplies and equipment" },
            new() { Id = Guid.NewGuid(), Name = "Manufacturing Components and Supplies", Description = "Manufacturing components" },
            new() { Id = Guid.NewGuid(), Name = "Medical Equipment and Accessories and Supplies", Description = "Medical supplies" },
            new() { Id = Guid.NewGuid(), Name = "Measuring and Observing and Testing Equipment", Description = "Testing equipment" },
            new() { Id = Guid.NewGuid(), Name = "Office Equipment and Accessories and Supplies", Description = "General office supplies and equipment" },
            new() { Id = Guid.NewGuid(), Name = "Paper Materials and Products", Description = "Paper and printing materials" },
            new() { Id = Guid.NewGuid(), Name = "Software", Description = "Software licenses and subscriptions" }
        };

        await context.ItemCategories!.AddRangeAsync(categories);
        await context.SaveChangesAsync();
    }
}
