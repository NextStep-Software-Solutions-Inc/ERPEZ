using System;
using System.Linq;
using System.Threading.Tasks;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;

namespace ERPEZ.Infrastructure.Persistence.Seeders;

public static class NoticeOfAwardDevSeeder
{
    public static async Task SeedAsync(IUnitOfWork unitOfWork)
    {
        // 1. Procurement Modes
        var modes = await unitOfWork.ProcurementModeRepository.ToListAsync(unitOfWork.ProcurementModeRepository.Query());
        var pbMode = modes.FirstOrDefault(m => m.Name.Contains("Public Bidding") || m.Name.Contains("Competitive Bidding"));
        if (pbMode == null)
        {
            pbMode = new ProcurementMode
            {
                Id = Guid.NewGuid(),
                Name = "Public Bidding",
                Description = "Competitive Public Bidding per R.A. 12009",
                MinSupplierCount = 3,
                IsActive = true
            };
            await unitOfWork.ProcurementModeRepository.AddAsync(pbMode);
        }

        var svpMode = modes.FirstOrDefault(m => m.Name.Contains("Small Value"));
        if (svpMode == null)
        {
            svpMode = new ProcurementMode
            {
                Id = Guid.NewGuid(),
                Name = "Small Value Procurement",
                Description = "Alternative Method of Procurement (SVP)",
                MinSupplierCount = 3,
                IsActive = true
            };
            await unitOfWork.ProcurementModeRepository.AddAsync(svpMode);
        }

        // 2. Supplier Category & Supplier
        var categories = await unitOfWork.SupplierCategoryRepository.ToListAsync(unitOfWork.SupplierCategoryRepository.Query());
        var category = categories.FirstOrDefault(c => c.Name == "IT Equipment & Services");
        if (category == null)
        {
            category = new SupplierCategory
            {
                Id = Guid.NewGuid(),
                Name = "IT Equipment & Services",
                Description = "Information Technology Hardware, Software, and Networking"
            };
            await unitOfWork.SupplierCategoryRepository.AddAsync(category);
        }

        var suppliers = await unitOfWork.SupplierRepository.ToListAsync(unitOfWork.SupplierRepository.Query());
        var supplier = suppliers.FirstOrDefault(s => s.Name == "Northstar Systems Inc.");
        if (supplier == null)
        {
            supplier = new Supplier
            {
                Id = Guid.NewGuid(),
                Name = "Northstar Systems Inc.",
                Email = "sales@northstarsystems.ph",
                ContactPerson = "John Northstar",
                ContactNumber = "+63 2 8123 4567",
                Address = "123 Tech Park, Makati City",
                PhilGEPSNumber = "PHILGEPS-SUPP-2026-99",
                SupplierCategoryId = category.Id,
                Status = nameof(SupplierStatusEnum.Approved),
                IsBlocked = false
            };
            await unitOfWork.SupplierRepository.AddAsync(supplier);
        }

        // 3. Consolidated PR
        var cprs = await unitOfWork.ConsolidatedPRRepository.ToListAsync(unitOfWork.ConsolidatedPRRepository.Query());
        var cpr = cprs.FirstOrDefault(c => c.CPRNumber == "CPR-2026-001");
        if (cpr == null)
        {
            cpr = new ConsolidatedPR
            {
                Id = Guid.NewGuid(),
                CPRNumber = "CPR-2026-001",
                Description = "Supply & Delivery of Server Hardware for Enterprise Operations",
                Purpose = "Datacenter Upgrade FY 2026",
                TotalAmount = 250000m,
                ConsolidationDate = new DateOnly(2026, 5, 1),
                Status = StatusEnum.Approved
            };
            await unitOfWork.ConsolidatedPRRepository.AddAsync(cpr);
        }

        // 4. Procurement Project (Public Bidding)
        var projects = await unitOfWork.ProcurementProjectRepository.ToListAsync(unitOfWork.ProcurementProjectRepository.Query());
        var pbProject = projects.FirstOrDefault(p => p.Title == "Supply & Delivery of Server Hardware");
        if (pbProject == null)
        {
            pbProject = new ProcurementProject
            {
                Id = Guid.NewGuid(),
                Title = "Supply & Delivery of Server Hardware",
                ScopeOfWork = "Procurement of 2 units rack-mount enterprise servers with redundant power supplies",
                ConsolidatedPRId = cpr.Id,
                ProcurementModeId = pbMode.Id,
                ABC = 250000m,
                Status = "ForAward"
            };
            await unitOfWork.ProcurementProjectRepository.AddAsync(pbProject);
        }

        // 5. AOB
        var aobs = await unitOfWork.AOBRepository.ToListAsync(unitOfWork.AOBRepository.Query());
        var aob = aobs.FirstOrDefault(a => a.AOBNumber == "AOB-2026-001");
        if (aob == null)
        {
            aob = new AOB
            {
                Id = Guid.NewGuid(),
                AOBNumber = "AOB-2026-001",
                Description = "Abstract of Bids for Server Hardware Project",
                AwardCriterion = BidEvaluationCriteria.LCRB,
                AOBDate = new DateOnly(2026, 5, 20),
                OpeningDate = new DateTime(2026, 5, 20, 9, 0, 0, DateTimeKind.Utc),
                Status = StatusEnum.Approved
            };
            await unitOfWork.AOBRepository.AddAsync(aob);

            var aobMap = new AOBProcurementProjectMapping
            {
                Id = Guid.NewGuid(),
                AOBId = aob.Id,
                ProcurementProjectId = pbProject.Id
            };
            await unitOfWork.AOBProcurementProjectMappingRepository.AddAsync(aobMap);
        }

        // 6. BAC Resolution (Public Bidding - Award Recommendation)
        var bacResolutions = await unitOfWork.BACResolutionRepository.ToListAsync(unitOfWork.BACResolutionRepository.Query());
        var pbBacRes = bacResolutions.FirstOrDefault(r => r.ResolutionNumber == "BAC-RES-2026-004");
        if (pbBacRes == null)
        {
            pbBacRes = new BACResolution
            {
                Id = Guid.NewGuid(),
                ResolutionNumber = "BAC-RES-2026-004",
                ResolutionType = "Award Recommendation",
                ProcurementProjectId = pbProject.Id,
                Status = "Approved",
                DateResolved = DateTime.UtcNow.AddDays(-2),
                WhereasClause = "WHEREAS, the Bids and Awards Committee conducted public bidding for the Supply and Delivery of Server Hardware, and Northstar Systems Inc. was determined to be the Lowest Calculated Responsive Bidder (LCRB);"
            };
            await unitOfWork.BACResolutionRepository.AddAsync(pbBacRes);
        }

        // 7. SVP Procurement Project & Resolution (For Alternative Mode Isolation Verification)
        var svpProject = projects.FirstOrDefault(p => p.Title == "Office Consumables - SVP Branch");
        if (svpProject == null)
        {
            svpProject = new ProcurementProject
            {
                Id = Guid.NewGuid(),
                Title = "Office Consumables - SVP Branch",
                ProcurementModeId = svpMode.Id,
                ABC = 45000m,
                Status = "Approved"
            };
            await unitOfWork.ProcurementProjectRepository.AddAsync(svpProject);
        }

        var svpBacRes = bacResolutions.FirstOrDefault(r => r.ResolutionNumber == "BAC-RES-SVP-001");
        if (svpBacRes == null)
        {
            svpBacRes = new BACResolution
            {
                Id = Guid.NewGuid(),
                ResolutionNumber = "BAC-RES-SVP-001",
                ResolutionType = "Award Recommendation",
                ProcurementProjectId = svpProject.Id,
                Status = "Approved",
                DateResolved = DateTime.UtcNow.AddDays(-1),
                WhereasClause = "WHEREAS, alternative mode of procurement through Small Value Procurement was conducted..."
            };
            await unitOfWork.BACResolutionRepository.AddAsync(svpBacRes);
        }

        await unitOfWork.SaveChangesAsync();
    }
}
