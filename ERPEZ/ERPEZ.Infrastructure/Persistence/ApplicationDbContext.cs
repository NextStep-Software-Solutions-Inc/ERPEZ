using ERPEZ.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Infrastructure.Persistence;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<Product> Products { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        const string schemaName = "catalog";
        //const string planningSchemaName = "planning";
        //const string procurementSchemaName = "procurement";
        //const string samsSchemaName = "sams";

        modelBuilder.HasDefaultSchema(schemaName);

        // Here we configure the Product entity to be in a specific schema
        modelBuilder.Entity<Product>().ToTable("Products", "catalog");

        base.OnModelCreating(modelBuilder);

    }
}