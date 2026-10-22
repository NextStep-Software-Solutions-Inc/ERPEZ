using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Infrastructure.Persistence.Repositories;

public class ModuleSeeder(IUnitOfWork unitOfWork) : IBaseSeeder
{
    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        var modules = new List<Module>
        {
            new()
            {
                Key = "ams",
                Name = "Account Management System",
                Description = "Manages user accounts, roles, and access control across the system.",
                IsActive = true
            },
            new()
            {
                Key = "pbms",
                Name = "Planning and Budget Management System",
                Description = "Handles strategic planning, annual budget preparation, performance KPIs, and commitment controls.",
                IsActive = true
            },
            new()
            {
                Key = "pms",
                Name = "Procurement Management System",
                Description = "Covers the procurement lifecycle from purchase requests (PR) and RFQ bidding to BAC awards and purchase orders.",
                IsActive = true
            },
            new()
            {
                Key = "sams",
                Name = "Supply and Asset Management System",
                Description = "Manages inventory, stock monitoring, and issuance of supplies and assets.",
                IsActive = false
            },
        };

        var existingModules = await unitOfWork.ModuleRepository.Query()
            .ToListAsync(cancellationToken);

        foreach (var def in modules)
        {
            var existing = existingModules.FirstOrDefault(e =>
                e.Key.Equals(def.Key, StringComparison.OrdinalIgnoreCase) ||
                (def.Key == "pbms" && (e.Key.Equals("planning", StringComparison.OrdinalIgnoreCase) || e.Name.Equals("Planning", StringComparison.OrdinalIgnoreCase))) ||
                e.Name.Equals(def.Name, StringComparison.OrdinalIgnoreCase));

            if (existing == null)
            {
                await unitOfWork.ModuleRepository.AddAsync(def, cancellationToken);
            }
            else
            {
                existing.Key = def.Key;
                existing.Name = def.Name;
                existing.Description = def.Description;
                existing.IsActive = def.IsActive;
                unitOfWork.ModuleRepository.Update(existing);
            }
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
