using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using PlanningObject = ERPEZ.Domain.Entities.Planning.Object;

namespace ERPEZ.Infrastructure.Persistence.Seeders;

/// <summary>
/// Seeds complete prerequisite master data, planning documents (WFP, LIB, PPMP), 
/// and supplier registry entries so users can immediately test PR, CPR, RFQ, and AOB in the UI.
/// Idempotent — safe to run on startup or on demand.
/// </summary>
public static class ProcurementTestDataSeeder
{
    public static async Task SeedAllAsync(ApplicationDbContext context, IUnitOfWork unitOfWork)
    {
        // 1. Base Master Seeders
        await OrganizationStructureSeeder.SeedAsync(context);
        await FundSourceSeeder.SeedDefaultAsync(context);
        await ItemCategorySeeder.SeedAsync(context);
        await ProcurementActivityTypeSeeder.SeedAsync(unitOfWork);

        // 2. Fiscal Year 2026
        var fy2026 = await context.FiscalYears!.FirstOrDefaultAsync(f => f.Year == 2026);
        if (fy2026 == null)
        {
            fy2026 = new FiscalYear
            {
                Id = Guid.NewGuid(),
                Year = 2026,
                Description = "Fiscal Year 2026",
                Status = "Active",
                IsLocked = false,
                StartDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2026, 12, 31, 23, 59, 59, DateTimeKind.Utc),
                CreatedBy = "System",
                CreatedAt = DateTime.UtcNow
            };
            await context.FiscalYears!.AddAsync(fy2026);
            await context.SaveChangesAsync();
        }

        // 3. Ensure Offices
        var officeType = await context.OfficeTypes!.FirstOrDefaultAsync(t => t.Code == "DIV")
            ?? await context.OfficeTypes!.FirstOrDefaultAsync()
            ?? new OfficeType { Id = Guid.NewGuid(), Name = "Division", Code = "DIV", CanHaveChildren = true, IsActive = true };

        var category = await context.Categories!.FirstOrDefaultAsync(c => c.Code == "ADMIN" || c.Code == "TECH")
            ?? await context.Categories!.FirstOrDefaultAsync()
            ?? new Category { Id = Guid.NewGuid(), Name = "Administrative", Code = "ADMIN", CanHaveChildren = true, IsActive = true };

        var adminLevel = await context.AdministrativeLevels!.FirstOrDefaultAsync(l => l.Code == "DIV")
            ?? await context.AdministrativeLevels!.FirstOrDefaultAsync()
            ?? new AdministrativeLevel { Id = Guid.NewGuid(), Name = "Division", Code = "DIV", CanHaveChildren = true, IsActive = true };

        var itOffice = await context.Offices!.FirstOrDefaultAsync(o => 
            o.Name == "Information Technology Services Division" || 
            o.Name == "Information and Communications Technology Division" ||
            o.Code == "ICTD");

        if (itOffice == null)
        {
            itOffice = new Office
            {
                Id = Guid.NewGuid(),
                Name = "Information Technology Services Division",
                Code = "ICTD",
                Description = "Manages IT infrastructure, software systems, and technology procurement.",
                Address = "Building A, 3rd Floor, Central Office",
                ResponsibilityCenterCode = "ICTD-101",
                BudgetCostCenter = "BCC-ICTD",
                OfficeTypeId = officeType.Id,
                CategoryId = category.Id,
                AdministrativeLevelId = adminLevel.Id,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "System"
            };
            await context.Offices!.AddAsync(itOffice);
            await context.SaveChangesAsync();
        }

        // Also ensure General Services Division for procurement
        var gsOffice = await context.Offices!.FirstOrDefaultAsync(o => o.Code == "GSPD" || o.Name.Contains("General Services"));
        if (gsOffice == null)
        {
            gsOffice = new Office
            {
                Id = Guid.NewGuid(),
                Name = "General Services and Procurement Division",
                Code = "GSPD",
                Description = "General Services and Procurement Division",
                Address = "Building B, Ground Floor",
                OfficeTypeId = officeType.Id,
                CategoryId = category.Id,
                AdministrativeLevelId = adminLevel.Id,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "System"
            };
            await context.Offices!.AddAsync(gsOffice);
            await context.SaveChangesAsync();
        }

        // 4. Fund Source (01101101)
        var fundSource = await context.FundSources!.FirstOrDefaultAsync(f => f.Code == "01101101")
            ?? await context.FundSources!.FirstOrDefaultAsync(f => f.Code == "011")
            ?? await context.FundSources!.FirstOrDefaultAsync();

        if (fundSource == null)
        {
            fundSource = new FundSource
            {
                Id = Guid.NewGuid(),
                Code = "01101101",
                Name = "Specific Budgets of National Government Agencies (Regular Agency Fund)",
                Type = FundSourceTypeEnum.FundCategory,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "System"
            };
            await context.FundSources!.AddAsync(fundSource);
            await context.SaveChangesAsync();
        }

        // 5. UACS Objects (Expenditure Classes)
        var ictObject = await context.Objects!.FirstOrDefaultAsync(o => o.Code == "50604050 00" || o.Name.Contains("Information and Communication Technology"));
        if (ictObject == null)
        {
            ictObject = new PlanningObject
            {
                Id = Guid.NewGuid(),
                Code = "50604050 00",
                Name = "Information and Communication Technology Equipment",
                IsActive = true,
                FiscalYearId = fy2026.Id,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "System"
            };
            await context.Objects!.AddAsync(ictObject);
        }

        var officeEquipObject = await context.Objects!.FirstOrDefaultAsync(o => o.Code == "50604050 02" || o.Name.Contains("Office Equipment"));
        if (officeEquipObject == null)
        {
            officeEquipObject = new PlanningObject
            {
                Id = Guid.NewGuid(),
                Code = "50604050 02",
                Name = "Office Equipment",
                IsActive = true,
                FiscalYearId = fy2026.Id,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "System"
            };
            await context.Objects!.AddAsync(officeEquipObject);
        }

        var suppliesObject = await context.Objects!.FirstOrDefaultAsync(o => o.Code == "50203010 00" || o.Name.Contains("Office Supplies"));
        if (suppliesObject == null)
        {
            suppliesObject = new PlanningObject
            {
                Id = Guid.NewGuid(),
                Code = "50203010 00",
                Name = "Office Supplies Expenses",
                IsActive = true,
                FiscalYearId = fy2026.Id,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "System"
            };
            await context.Objects!.AddAsync(suppliesObject);
        }
        await context.SaveChangesAsync();

        // 6. Procurement Category & Modes
        var goodsCategory = await context.ProcurementCategories!.FirstOrDefaultAsync(c => c.Name == "Goods");
        if (goodsCategory == null)
        {
            goodsCategory = new ProcurementCategory
            {
                Id = Guid.NewGuid(),
                Name = "Goods",
                Description = "General goods, supplies, equipment, and materials"
            };
            await context.ProcurementCategories!.AddAsync(goodsCategory);
            await context.SaveChangesAsync();
        }

        var svpMode = await context.ProcurementModes!.FirstOrDefaultAsync(m => m.Name.Contains("Small Value Procurement"));
        if (svpMode == null)
        {
            svpMode = new ProcurementMode
            {
                Id = Guid.NewGuid(),
                Name = "NP-53.9 - Small Value Procurement",
                Description = "Negotiated Procurement - Small Value Procurement (Section 53.9)",
                MinThreshold = 50000m,
                MaxThreshold = 1000000m,
                MinSupplierCount = 3,
                IsActive = true,
                IsArchived = false,
                ProcurementCategoryId = goodsCategory.Id
            };
            await context.ProcurementModes!.AddAsync(svpMode);
        }

        var shoppingMode = await context.ProcurementModes!.FirstOrDefaultAsync(m => m.Name.Contains("Shopping"));
        if (shoppingMode == null)
        {
            shoppingMode = new ProcurementMode
            {
                Id = Guid.NewGuid(),
                Name = "Shopping (Sec. 52.1.b)",
                Description = "Shopping under Section 52.1(b) for readily available off-the-shelf goods",
                MinThreshold = 10000m,
                MaxThreshold = 1000000m,
                MinSupplierCount = 3,
                IsActive = true,
                IsArchived = false,
                ProcurementCategoryId = goodsCategory.Id
            };
            await context.ProcurementModes!.AddAsync(shoppingMode);
        }

        var biddingMode = await context.ProcurementModes!.FirstOrDefaultAsync(m => m.Name.Contains("Public Bidding") || m.Name.Contains("Competitive Bidding"));
        if (biddingMode == null)
        {
            biddingMode = new ProcurementMode
            {
                Id = Guid.NewGuid(),
                Name = "Competitive Bidding",
                Description = "Public / Competitive Bidding under RA 9184",
                MinThreshold = 1000000m,
                MaxThreshold = null,
                MinSupplierCount = 1,
                IsActive = true,
                IsArchived = false,
                ProcurementCategoryId = goodsCategory.Id
            };
            await context.ProcurementModes!.AddAsync(biddingMode);
        }
        await context.SaveChangesAsync();

        // 7. Supplier Categories & Approved Suppliers (Supplier Registry)
        var ictSupplierCat = await context.SupplierCategories!
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(sc => 
                sc.Name == "Information & Communications Technology (ICT)" || 
                sc.Name.Contains("Information") || 
                sc.Name.Contains("ICT"));
        if (ictSupplierCat == null)
        {
            ictSupplierCat = new SupplierCategory
            {
                Id = Guid.NewGuid(),
                Name = "Information & Communications Technology (ICT)",
                Description = "Computers, servers, network hardware, software, and IT services"
            };
            await context.SupplierCategories!.AddAsync(ictSupplierCat);
        }
        else if (ictSupplierCat.IsDeleted)
        {
            ictSupplierCat.IsDeleted = false;
            context.SupplierCategories!.Update(ictSupplierCat);
        }

        var officeSuppliesCat = await context.SupplierCategories!
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(sc => 
                sc.Name == "Office Supplies & Devices" || 
                sc.Name.Contains("Office Supplies"));
        if (officeSuppliesCat == null)
        {
            officeSuppliesCat = new SupplierCategory
            {
                Id = Guid.NewGuid(),
                Name = "Office Supplies & Devices",
                Description = "Stationery, office consumables, printers, and office equipment"
            };
            await context.SupplierCategories!.AddAsync(officeSuppliesCat);
        }
        else if (officeSuppliesCat.IsDeleted)
        {
            officeSuppliesCat.IsDeleted = false;
            context.SupplierCategories!.Update(officeSuppliesCat);
        }

        var generalServicesCat = await context.SupplierCategories!
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(sc => 
                sc.Name == "General Merchandise & Catering" || 
                sc.Name.Contains("General Merchandise") || 
                sc.Name.Contains("General Services"));
        if (generalServicesCat == null)
        {
            generalServicesCat = new SupplierCategory
            {
                Id = Guid.NewGuid(),
                Name = "General Merchandise & Catering",
                Description = "General supplies, catering, event management, and miscellaneous services"
            };
            await context.SupplierCategories!.AddAsync(generalServicesCat);
        }
        else if (generalServicesCat.IsDeleted)
        {
            generalServicesCat.IsDeleted = false;
            context.SupplierCategories!.Update(generalServicesCat);
        }
        await context.SaveChangesAsync();

        // Seed 3 Approved Suppliers + 1 Pending + 1 Blocked
        await SeedSupplierWithRequirementsAsync(context,
            name: "Apex IT Solutions & Enterprise Corp.",
            categoryId: ictSupplierCat.Id,
            tin: "123-456-789-000",
            philGeps: "202601-100234-A",
            permit: "BP-2026-08192",
            contactPerson: "Maria Santos",
            contactNumber: "09171234567",
            email: "sales@apexitsolutions.ph",
            address: "Unit 1204 Prestige Tower, Ortigas Center, Pasig City",
            status: "Approved",
            isBlocked: false);

        await SeedSupplierWithRequirementsAsync(context,
            name: "Bayan Microtech Systems Philippines Inc.",
            categoryId: ictSupplierCat.Id,
            tin: "987-654-321-000",
            philGeps: "202601-100567-B",
            permit: "BP-2026-09412",
            contactPerson: "Juan Dela Cruz",
            contactNumber: "09209876543",
            email: "bids@bayanmicrotech.com.ph",
            address: "45 Sen. Gil Puyat Ave, Makati City",
            status: "Approved",
            isBlocked: false);

        await SeedSupplierWithRequirementsAsync(context,
            name: "CyberTech Logistics & Supplies Corp.",
            categoryId: ictSupplierCat.Id,
            tin: "456-789-123-000",
            philGeps: "202601-100890-C",
            permit: "BP-2026-11843",
            contactPerson: "Ricardo Gonzales",
            contactNumber: "09185551234",
            email: "procurement@cybertechph.com",
            address: "88 EDSA, Cubao, Quezon City",
            status: "Approved",
            isBlocked: false);

        await SeedSupplierWithRequirementsAsync(context,
            name: "PrimeOffice Depot & Stationery Inc.",
            categoryId: officeSuppliesCat.Id,
            tin: "321-654-987-000",
            philGeps: "202601-100333-D",
            permit: "BP-2026-05123",
            contactPerson: "Elena Bautista",
            contactNumber: "09179998877",
            email: "orders@primeofficedepot.ph",
            address: "Unit 5, Commercial Center, Quezon Avenue, Quezon City",
            status: "Approved",
            isBlocked: false);

        await SeedSupplierWithRequirementsAsync(context,
            name: "MetroServe General Services & Catering",
            categoryId: generalServicesCat.Id,
            tin: "789-123-456-000",
            philGeps: "202601-100999-E",
            permit: "BP-2026-03321",
            contactPerson: "Carlos Rivera",
            contactNumber: "09223334455",
            email: "info@metroserve.ph",
            address: "123 Taft Ave, Manila",
            status: "Pending",
            isBlocked: false);

        await SeedSupplierWithRequirementsAsync(context,
            name: "Blacklisted Merchant Corp.",
            categoryId: ictSupplierCat.Id,
            tin: "654-987-321-000",
            philGeps: "202601-100000-X",
            permit: "BP-2026-00001",
            contactPerson: "Non-Compliant Agent",
            contactNumber: "09000000000",
            email: "blocked@blacklistedmerchant.ph",
            address: "Unknown Location",
            status: "Approved",
            isBlocked: true,
            statusNote: "Debarred by GPPB due to project abandonment and non-performance");

        // 8. Approved Work and Financial Plan (WFP)
        var wfp = await context.WFPs!.FirstOrDefaultAsync(w => 
            w.OfficeId == itOffice.Id && 
            w.ProjectTitle == "ICT Infrastructure Modernization & Upgrading Plan FY 2026");

        if (wfp == null)
        {
            wfp = new WFP
            {
                Id = Guid.NewGuid(),
                OfficeId = itOffice.Id,
                ProjectTitle = "ICT Infrastructure Modernization & Upgrading Plan FY 2026",
                ProjectOwner = "IT Division Chief",
                ProjectStartDate = new DateOnly(2026, 1, 1),
                ProjectEndDate = new DateOnly(2026, 12, 31),
                ProposedBudget = 790000m,
                GeneralObjective = "Modernize computing infrastructure and office printing capabilities for agency operations.",
                Mode = ModeEnum.External,
                FundSourceId = fundSource.Id,
                Status = StatusEnum.Approved,
                SubmittedDate = DateTime.UtcNow.AddDays(-30),
                ApprovedDate = DateTime.UtcNow.AddDays(-25),
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "System"
            };

            var wfpObjective = new WFPObjective
            {
                Id = Guid.NewGuid(),
                WFPId = wfp.Id,
                Description = "Modernize agency computing hardware and printing throughput",
                Weight = 100m,
                Outcome = "100% replacement of obsolete laptops and deployment of high-yield multi-function printers"
            };
            wfp.WFPObjectives.Add(wfpObjective);

            var wfpActivity = new WFPObjectiveActivity
            {
                Id = Guid.NewGuid(),
                WFPId = wfp.Id,
                WFPObjectiveId = wfpObjective.Id,
                ActivityName = "Workstation & Laser Printer Procurement",
                Indicator = "10 High-Performance Laptops and 5 Enterprise Multi-Function Printers procured and deployed",
                Weight = 100m
            };
            wfpObjective.WFPObjectiveActivities.Add(wfpActivity);

            wfpActivity.WFPObjectiveActivityExpenditures.Add(new WFPObjectiveActivityExpenditure
            {
                Id = Guid.NewGuid(),
                WFPObjectiveActivityId = wfpActivity.Id,
                ObjectId = ictObject.Id,
                ItemDescription = "High-Performance Workstation Laptop 15.6 inch",
                Quantity = 10,
                UnitCost = 65000m
            });

            wfpActivity.WFPObjectiveActivityExpenditures.Add(new WFPObjectiveActivityExpenditure
            {
                Id = Guid.NewGuid(),
                WFPObjectiveActivityId = wfpActivity.Id,
                ObjectId = officeEquipObject.Id,
                ItemDescription = "Enterprise Multi-Function Monochrome Laser Printer",
                Quantity = 5,
                UnitCost = 28000m
            });

            await context.WFPs!.AddAsync(wfp);
            await context.SaveChangesAsync();
        }

        // 9. Approved Line-Item Budget (LIB)
        var lib = await context.LineItemBudgets!.FirstOrDefaultAsync(l => l.LIBNumber == "LIB-2026-ICTD-001");
        if (lib == null)
        {
            var wfpActivity = await context.WFPObjectiveActivities!.FirstOrDefaultAsync(a => a.WFPId == wfp.Id)
                ?? wfp.WFPObjectives.SelectMany(o => o.WFPObjectiveActivities).First();

            lib = new LineItemBudget
            {
                Id = Guid.NewGuid(),
                LIBNumber = "LIB-2026-ICTD-001",
                Name = "FY 2026 Operational Budget for ICT Modernization",
                OfficeId = itOffice.Id,
                FiscalYearId = fy2026.Id,
                FundSourceId = fundSource.Id,
                SourceType = "WFP",
                SourceId = wfp.Id,
                Scope = "Activity",
                Level = "Office",
                Status = "Approved",
                Version = 1,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "System"
            };

            var libActivity = new LineItemBudgetActivity
            {
                Id = Guid.NewGuid(),
                LineItemBudgetId = lib.Id,
                WFPObjectiveActivityId = wfpActivity.Id,
                Name = "Workstation & Laser Printer Procurement"
            };
            lib.LineItemBudgetActivities.Add(libActivity);

            lib.LineItemBudgetDetails.Add(new LineItemBudgetDetail
            {
                Id = Guid.NewGuid(),
                LineItemBudgetId = lib.Id,
                LineItemBudgetActivityId = libActivity.Id,
                ObjectId = ictObject.Id,
                Description = "Procurement of 10 units high-performance developer laptops",
                UnitQuantity = 10,
                UnitCost = 65000m,
                Budget = 650000m,
                TimelineType = "Quarterly",
                StartDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2026, 3, 31, 23, 59, 59, DateTimeKind.Utc)
            });

            lib.LineItemBudgetDetails.Add(new LineItemBudgetDetail
            {
                Id = Guid.NewGuid(),
                LineItemBudgetId = lib.Id,
                LineItemBudgetActivityId = libActivity.Id,
                ObjectId = officeEquipObject.Id,
                Description = "Procurement of 5 units heavy-duty laser printers",
                UnitQuantity = 5,
                UnitCost = 28000m,
                Budget = 140000m,
                TimelineType = "Quarterly",
                StartDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(2026, 3, 31, 23, 59, 59, DateTimeKind.Utc)
            });

            await context.LineItemBudgets!.AddAsync(lib);
            await context.SaveChangesAsync();
        }

        // 10. Approved PPMP (Project Procurement Management Plan)
        var ppmp = await context.PPMPs!.FirstOrDefaultAsync(p => p.PPMPNumber == "PPMP-2026-ICTD-001");
        if (ppmp == null)
        {
            var libActivity = await context.LineItemBudgetActivities!.FirstOrDefaultAsync(a => a.LineItemBudgetId == lib.Id)
                ?? lib.LineItemBudgetActivities.First();

            ppmp = new PPMP
            {
                Id = Guid.NewGuid(),
                PPMPNumber = "PPMP-2026-ICTD-001",
                Description = "Annual Procurement Plan for ICT Equipment FY 2026",
                OfficeId = itOffice.Id,
                FiscalYearId = fy2026.Id,
                FundSourceId = fundSource.Id,
                LIBId = lib.Id,
                IsMaster = false,
                IsFinal = true,
                Version = 1,
                TotalEstimatedBudget = 790000m,
                Status = StatusEnum.Approved,
                SubmittedDate = DateTime.UtcNow.AddDays(-20),
                ApprovedDate = DateTime.UtcNow.AddDays(-15),
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "System"
            };

            var ppmpActivity = new PPMPActivity
            {
                Id = Guid.NewGuid(),
                PPMPId = ppmp.Id,
                LIBActivityId = libActivity.Id
            };
            ppmp.PPMPActivities.Add(ppmpActivity);

            var ppmpExpenditure = new PPMPExpenditureItem
            {
                Id = Guid.NewGuid(),
                PPMPId = ppmp.Id,
                PPMPActivityId = ppmpActivity.Id,
                ObjectId = ictObject.Id,
                IsProcurable = true,
                TotalCost = 790000m
            };
            ppmp.PPMPExpenditureItems.Add(ppmpExpenditure);

            // Item 1: Laptop
            var laptopItem = new PPMPItem
            {
                Id = Guid.NewGuid(),
                PPMPExpenditureItemId = ppmpExpenditure.Id,
                Name = "High-Performance Workstation Laptop 15.6 inch",
                Description = "Intel Core i7 / Ryzen 7, 16GB DDR5 RAM, 512GB NVMe SSD, 15.6 inch FHD Display",
                Unit = "Unit",
                UnitPrice = 65000m,
                PlannedQuantity = 10,
                ProcurementModeId = svpMode.Id,
                ProjectType = ProcurementProjectType.Goods,
                PreProcurementConference = false,
                ProcurementStartDate = new DateOnly(2026, 8, 1),
                ProcurementEndDate = new DateOnly(2026, 8, 15),
                ExpectedDeliveryStart = new DateOnly(2026, 9, 1),
                ExpectedDeliveryEnd = new DateOnly(2026, 9, 15),
                CSEItemId = null,
                NonCSEItemId = null
            };
            laptopItem.PPMPItemAllocations.Add(new PPMPItemAllocation
            {
                Id = Guid.NewGuid(),
                PPMPItemId = laptopItem.Id,
                AllocationMonth = AllocationMonthEnum.January,
                Quantity = 5,
                Amount = 325000m
            });
            laptopItem.PPMPItemAllocations.Add(new PPMPItemAllocation
            {
                Id = Guid.NewGuid(),
                PPMPItemId = laptopItem.Id,
                AllocationMonth = AllocationMonthEnum.February,
                Quantity = 5,
                Amount = 325000m
            });
            ppmpExpenditure.PPMPItems.Add(laptopItem);

            // Item 2: Printer
            var printerItem = new PPMPItem
            {
                Id = Guid.NewGuid(),
                PPMPExpenditureItemId = ppmpExpenditure.Id,
                Name = "Enterprise Multi-Function Monochrome Laser Printer",
                Description = "Heavy-duty print/scan/copy, 40ppm duplex, network Ethernet & Wi-Fi",
                Unit = "Unit",
                UnitPrice = 28000m,
                PlannedQuantity = 5,
                ProcurementModeId = svpMode.Id,
                ProjectType = ProcurementProjectType.Goods,
                PreProcurementConference = false,
                ProcurementStartDate = new DateOnly(2026, 8, 1),
                ProcurementEndDate = new DateOnly(2026, 8, 15),
                ExpectedDeliveryStart = new DateOnly(2026, 9, 1),
                ExpectedDeliveryEnd = new DateOnly(2026, 9, 15),
                CSEItemId = null,
                NonCSEItemId = null
            };
            printerItem.PPMPItemAllocations.Add(new PPMPItemAllocation
            {
                Id = Guid.NewGuid(),
                PPMPItemId = printerItem.Id,
                AllocationMonth = AllocationMonthEnum.January,
                Quantity = 2,
                Amount = 56000m
            });
            printerItem.PPMPItemAllocations.Add(new PPMPItemAllocation
            {
                Id = Guid.NewGuid(),
                PPMPItemId = printerItem.Id,
                AllocationMonth = AllocationMonthEnum.February,
                Quantity = 3,
                Amount = 84000m
            });
            ppmpExpenditure.PPMPItems.Add(printerItem);

            await context.PPMPs!.AddAsync(ppmp);
            await context.SaveChangesAsync();
        }
        else
        {
            // Backfill existing seeded PPMP items if PlannedQuantity or dates were missing
            var existingItems = await context.PPMPItems!
                .Where(i => i.PPMPExpenditureItem.PPMPId == ppmp.Id)
                .ToListAsync();

            bool modified = false;
            foreach (var item in existingItems)
            {
                if (item.PlannedQuantity == 0)
                {
                    if (item.Name.Contains("Laptop", StringComparison.OrdinalIgnoreCase))
                    {
                        item.PlannedQuantity = 10;
                    }
                    else if (item.Name.Contains("Printer", StringComparison.OrdinalIgnoreCase))
                    {
                        item.PlannedQuantity = 5;
                    }
                    else
                    {
                        var totalAllocated = await context.PPMPItemAllocations!
                            .Where(a => a.PPMPItemId == item.Id)
                            .SumAsync(a => a.Quantity);
                        item.PlannedQuantity = totalAllocated > 0 ? totalAllocated : 1;
                    }
                    modified = true;
                }

                if (item.PreProcurementConference == null)
                {
                    item.PreProcurementConference = false;
                    modified = true;
                }
                if (item.ProcurementStartDate == null)
                {
                    item.ProcurementStartDate = new DateOnly(2026, 8, 1);
                    item.ProcurementEndDate = new DateOnly(2026, 8, 15);
                    item.ExpectedDeliveryStart = new DateOnly(2026, 9, 1);
                    item.ExpectedDeliveryEnd = new DateOnly(2026, 9, 15);
                    modified = true;
                }
            }

            if (modified)
            {
                await context.SaveChangesAsync();
            }
        }

        // 11. Test Purchase Request (Submitted Non-CSE PR from ICT Division)
        var pr = await context.PurchaseRequests!.FirstOrDefaultAsync(p => p.PRNumber == "PR-2026-ICTD-001");
        if (pr == null)
        {
            var laptopPPMPItem = await context.PPMPItems!.FirstOrDefaultAsync(i => i.Name.Contains("Laptop"));
            var printerPPMPItem = await context.PPMPItems!.FirstOrDefaultAsync(i => i.Name.Contains("Printer"));

            pr = new PurchaseRequest
            {
                Id = Guid.NewGuid(),
                PRNumber = "PR-2026-ICTD-001",
                Description = "Procurement of Workstations & Printers for ICT Staff",
                Purpose = "Equip new technical staff and upgrade aging office workstations.",
                PRType = PRType.NonCSE,
                OfficeId = itOffice.Id,
                FundSourceId = fundSource.Id,
                PPMPId = ppmp.Id,
                RequestedDate = new DateOnly(2026, 8, 10),
                TotalAmount = 790000m,
                Status = StatusEnum.Submitted,
                CreatedAt = DateTime.UtcNow.AddDays(-10),
                CreatedBy = "System"
            };

            if (laptopPPMPItem != null)
            {
                pr.PRItems.Add(new PRItem
                {
                    Id = Guid.NewGuid(),
                    PurchaseRequestId = pr.Id,
                    PPMPItemId = laptopPPMPItem.Id,
                    Name = laptopPPMPItem.Name,
                    Description = laptopPPMPItem.Description,
                    UnitCost = laptopPPMPItem.UnitPrice,
                    RequestedQuantity = 10,
                    Amount = 650000m,
                    IsNonCSE = true,
                    RequestedMonth = AllocationMonthEnum.January
                });
            }

            if (printerPPMPItem != null)
            {
                pr.PRItems.Add(new PRItem
                {
                    Id = Guid.NewGuid(),
                    PurchaseRequestId = pr.Id,
                    PPMPItemId = printerPPMPItem.Id,
                    Name = printerPPMPItem.Name,
                    Description = printerPPMPItem.Description,
                    UnitCost = printerPPMPItem.UnitPrice,
                    RequestedQuantity = 5,
                    Amount = 140000m,
                    IsNonCSE = true,
                    RequestedMonth = AllocationMonthEnum.January
                });
            }

            await context.PurchaseRequests!.AddAsync(pr);
            await context.SaveChangesAsync();
        }

        // 12. Public Bidding Portal & Public Opportunities
        await SeedPublicBiddingPortalAsync(context, unitOfWork);

        // 13. Purchase Orders & Source Documents (SVP, Public Bidding, Direct Acquisition)
        await SeedPurchaseOrdersAndSourceDocumentsAsync(context, unitOfWork);
    }

    private static async Task SeedSupplierWithRequirementsAsync(
        ApplicationDbContext context,
        string name,
        Guid categoryId,
        string tin,
        string philGeps,
        string permit,
        string contactPerson,
        string contactNumber,
        string email,
        string address,
        string status,
        bool isBlocked,
        string? statusNote = null)
    {
        // 1. If an active supplier already exists with matching Name, TIN, or Permit, do nothing
        var activeExisting = await context.Suppliers!
            .Include(s => s.SupplierRequirements)
            .FirstOrDefaultAsync(s => s.Name == name || s.TINNumber == tin || s.BusinessPermitNo == permit);

        if (activeExisting != null)
        {
            return;
        }

        // 2. Check if a soft-deleted supplier exists that can be safely restored
        var softDeleted = await context.Suppliers!
            .IgnoreQueryFilters()
            .Include(s => s.SupplierRequirements)
            .FirstOrDefaultAsync(s => s.IsDeleted && (s.Name == name || s.TINNumber == tin || s.BusinessPermitNo == permit));

        if (softDeleted != null)
        {
            var conflict = await context.Suppliers!
                .AnyAsync(s => s.TINNumber == softDeleted.TINNumber || s.BusinessPermitNo == softDeleted.BusinessPermitNo);

            if (!conflict)
            {
                softDeleted.IsDeleted = false;
                context.Suppliers!.Update(softDeleted);
                await context.SaveChangesAsync();
                return;
            }
        }

        // 3. Prevent inserting a duplicate if an active supplier already has this TIN or Permit
        var hasUniqueConflict = await context.Suppliers!
            .AnyAsync(s => s.TINNumber == tin || s.BusinessPermitNo == permit);

        if (hasUniqueConflict)
        {
            return;
        }

        var supplier = new Supplier
        {
            Id = Guid.NewGuid(),
            Name = name,
            SupplierCategoryId = categoryId,
            TINNumber = tin,
            PhilGEPSNumber = philGeps,
            BusinessPermitNo = permit,
            ContactPerson = contactPerson,
            ContactNumber = contactNumber,
            Email = email,
            Address = address,
            Status = status,
            IsBlocked = isBlocked,
            StatusNote = statusNote,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "System"
        };

        var isVerified = status == "Approved";

        supplier.SupplierRequirements.Add(new SupplierRequirement
        {
            Id = Guid.NewGuid(),
            SupplierId = supplier.Id,
            RequirementName = "Mayor's / Business Permit (2026)",
            Url = $"/documents/suppliers/{permit.ToLower()}_mayors_permit.pdf",
            IsVerified = isVerified
        });

        supplier.SupplierRequirements.Add(new SupplierRequirement
        {
            Id = Guid.NewGuid(),
            SupplierId = supplier.Id,
            RequirementName = "PhilGEPS Certificate of Registration (Platinum)",
            Url = $"/documents/suppliers/{philGeps.ToLower()}_philgeps.pdf",
            IsVerified = isVerified
        });

        supplier.SupplierRequirements.Add(new SupplierRequirement
        {
            Id = Guid.NewGuid(),
            SupplierId = supplier.Id,
            RequirementName = "BIR Tax Clearance Certificate (Executive Order 398)",
            Url = $"/documents/suppliers/{tin.Replace("-", "")}_tax_clearance.pdf",
            IsVerified = isVerified
        });

        supplier.SupplierRequirements.Add(new SupplierRequirement
        {
            Id = Guid.NewGuid(),
            SupplierId = supplier.Id,
            RequirementName = "Omnibus Sworn Statement (GPPB Prescribed Form)",
            Url = $"/documents/suppliers/omnibus_sworn_statement.pdf",
            IsVerified = isVerified
        });

        await context.Suppliers!.AddAsync(supplier);
        await context.SaveChangesAsync();
    }

    public static async Task SeedPublicBiddingPortalAsync(ApplicationDbContext context, IUnitOfWork unitOfWork)
    {
        // 1. Ensure Master Document Types
        var docTypes = new (string Name, string Description, int EnvelopeType, string? TemplateUrl)[]
        {
            ("PhilGEPS Certificate of Registration (Platinum Membership)", "Valid and current Platinum PhilGEPS Registration Certificate with Annex A", 1, null),
            ("Statement of Single Largest Completed Contract (SLCC)", "Statement of SLCC similar to the contract to be bid within the last 3-5 years", 1, null),
            ("Audited Financial Statements (AFS)", "Complete Audited Financial Statements stamped 'received' by BIR or its duly accredited institutions", 1, null),
            ("NFCC Computation or Committed Line of Credit", "Net Financial Contracting Capacity (NFCC) computation in accordance with ITB Clause 5.5", 1, null),
            ("Technical Specifications Compliance & Schedule of Requirements", "Compliance matrix for technical specifications with supporting brochures/datasheets", 1, null),
            ("Omnibus Sworn Statement (GPPB Prescribed Form)", "Original notarized Omnibus Sworn Statement with Secretary's Certificate/SPA", 1, "/documents/templates/omnibus_sworn_statement.pdf"),
            ("Bid Securing Declaration Form", "Original notarized Bid Securing Declaration or acceptable form of Bid Security", 1, "/documents/templates/bid_securing_declaration.pdf"),
            ("Financial Bid Form", "Original copy of completed and signed Financial Bid Form (GPPB standard format)", 2, "/documents/templates/financial_bid_form.pdf"),
            ("Detailed Bill of Quantities / Price Schedule", "Itemized price breakdown per component/line item including taxes and duties", 2, "/documents/templates/detailed_price_schedule.pdf")
        };

        var masterDocTypeDict = new Dictionary<string, MasterDocumentType>();
        foreach (var (name, desc, envType, tempUrl) in docTypes)
        {
            var existing = await context.MasterDocumentTypes!
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(d => d.Name.ToLower() == name.ToLower());
            if (existing == null)
            {
                existing = new MasterDocumentType
                {
                    Id = Guid.NewGuid(),
                    Name = name,
                    Description = desc,
                    EnvelopeType = envType,
                    TemplateFileUrl = tempUrl,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "System"
                };
                await context.MasterDocumentTypes!.AddAsync(existing);
            }
            else if (existing.IsDeleted)
            {
                existing.IsDeleted = false;
                existing.Description = desc;
                existing.EnvelopeType = envType;
                if (!string.IsNullOrEmpty(tempUrl)) existing.TemplateFileUrl = tempUrl;
                context.MasterDocumentTypes!.Update(existing);
            }
            masterDocTypeDict[name] = existing;
        }
        await context.SaveChangesAsync();

        // 2. Fetch Activity Types
        var actPosting = await context.ProcurementActivityTypes!.FirstOrDefaultAsync(a => a.SystemRole == ProcurementActivitySystemRole.AdvertisementPosting);
        var actPreBid = await context.ProcurementActivityTypes!.FirstOrDefaultAsync(a => a.SystemRole == ProcurementActivitySystemRole.PreBidConference);
        var actOpening = await context.ProcurementActivityTypes!.FirstOrDefaultAsync(a => a.SystemRole == ProcurementActivitySystemRole.SubmissionOpeningOfBids);

        // Fetch Goods Category & Modes
        var goodsCat = await context.ProcurementCategories!.FirstOrDefaultAsync(c => c.Name == "Goods" || c.Name.Contains("Goods"))
            ?? new ProcurementCategory { Id = Guid.NewGuid(), Name = "Goods", Description = "Goods & Equipment" };
        var publicBiddingMode = await context.ProcurementModes!.FirstOrDefaultAsync(m => m.Name.Contains("Competitive Bidding") || m.Name.Contains("Public Bidding"))
            ?? await context.ProcurementModes!.FirstOrDefaultAsync();
        var svpMode = await context.ProcurementModes!.FirstOrDefaultAsync(m => m.Name.Contains("Small Value Procurement"))
            ?? await context.ProcurementModes!.FirstOrDefaultAsync();

        // 3. Define Public Bidding Projects
        var projectDefinitions = new[]
        {
            new
            {
                ContractNo = "ITB-2026-BAC-001",
                Title = "Supply, Delivery, and Installation of High-Performance Computing Cluster and GPU Servers for AI Research",
                ABC = 18500000.00m,
                Mode = publicBiddingMode,
                Status = "Posted",
                ScopeOfWork = "Supply, delivery, installation, integration, testing, and commissioning of high-performance multi-GPU server compute nodes, 200Gbps InfiniBand high-speed interconnect switches, 500TB parallel storage arrays, and complete deep learning runtime software stack for institutional AI and data science research.",
                NonRefundableFee = 25000.00m,
                DeliveryDays = 60,
                DaysPostedAgo = 10,
                DaysPreBidAgo = 3,
                DaysDeadlineAhead = 14,
                Applicants = new[]
                {
                    new { Company = "Apex Computech Solutions Inc.", Contact = "Engr. Marcus Vance", Email = "bids@apexcompute.ph", Phone = "+63 917 555 1234", TIN = "123-456-789-000", Address = "Unit 1204 Cyberpark Tower 1, Cubao, Quezon City", Status = "Submitted", Remarks = (string?)null },
                    new { Company = "Nexus IT Systems Philippines Corp.", Contact = "Claire Dela Cruz", Email = "procurement@nexus-it.com.ph", Phone = "+63 920 888 5678", TIN = "987-654-321-000", Address = "8th Floor Enterprise Center, Ayala Avenue, Makati City", Status = "Submitted", Remarks = (string?)null }
                }
            },
            new
            {
                ContractNo = "ITB-2026-BAC-002",
                Title = "Procurement of Advanced Analytical Instruments and Spectrophotometers for Chemistry & Material Science Laboratory",
                ABC = 8750000.00m,
                Mode = publicBiddingMode,
                Status = "ClosingSoon",
                ScopeOfWork = "Procurement of 2x UV-Vis-NIR Double-Beam Spectrophotometers, 1x Research-Grade FTIR Spectrometer with diamond ATR accessory, 4x High-Precision Analytical Micro-Balances, calibration standards, and on-site operator certification training.",
                NonRefundableFee = 10000.00m,
                DeliveryDays = 45,
                DaysPostedAgo = 18,
                DaysPreBidAgo = 10,
                DaysDeadlineAhead = 3,
                Applicants = new[]
                {
                    new { Company = "BioTech Scientific Supplies Corp.", Contact = "Dr. Arthur Pendelton", Email = "govbids@biotech-sci.ph", Phone = "+63 918 333 4455", TIN = "456-789-012-000", Address = "BioTech Hub, C5 Road, Pasig City", Status = "Submitted", Remarks = (string?)null }
                }
            },
            new
            {
                ContractNo = "SVP-2026-GSPD-003",
                Title = "Supply and Delivery of 86-inch Interactive Smart Displays and Wall Mounts for Engineering Lecture Halls",
                ABC = 950000.00m,
                Mode = svpMode,
                Status = "Posted",
                ScopeOfWork = "Supply, delivery, wall mounting, and cabling of 5 units 86-inch 4K UHD Interactive Touchscreen Displays with 40-point multi-touch, anti-glare tempered glass, integrated dual OS (Android 13 / Windows 11 Pro OPS), stylus pens, and screen mirroring modules.",
                NonRefundableFee = 1000.00m,
                DeliveryDays = 30,
                DaysPostedAgo = 4,
                DaysPreBidAgo = -1,
                DaysDeadlineAhead = 8,
                Applicants = new[]
                {
                    new { Company = "OmniTech Display Solutions", Contact = "Jonathan Sy", Email = "sales@omnitechdisplays.ph", Phone = "+63 922 456 7890", TIN = "789-012-345-000", Address = "15 Gilmore Ave, New Manila, Quezon City", Status = "Submitted", Remarks = (string?)null },
                    new { Company = "Prime Smart Living Corp.", Contact = "Elena Roxas", Email = "bids@primesmart.ph", Phone = "+63 917 222 9988", TIN = "321-654-987-000", Address = "24 Bonifacio High Street, BGC, Taguig City", Status = "Submitted", Remarks = (string?)null }
                }
            },
            new
            {
                ContractNo = "ITB-2026-INFRA-004",
                Title = "Design, Supply, and Construction of Renewable Solar Micro-Grid and Energy Storage Facility",
                ABC = 35000000.00m,
                Mode = publicBiddingMode,
                Status = "Posted",
                ScopeOfWork = "Turnkey engineering design, supply, installation, civil works, grid-synchronization, and commissioning of 500kWp high-efficiency monocrystalline solar PV panels across academic buildings, 1MWh Containerized Lithium-Iron-Phosphate Battery Energy Storage System (BESS), and real-time SCADA energy management dashboard.",
                NonRefundableFee = 25000.00m,
                DeliveryDays = 180,
                DaysPostedAgo = 20,
                DaysPreBidAgo = 12,
                DaysDeadlineAhead = 22,
                Applicants = new[]
                {
                    new { Company = "Solaria Green Energy Infrastructure Inc.", Contact = "Engr. Roberto Gomez", Email = "epc@solariagreen.ph", Phone = "+63 919 111 2233", TIN = "654-321-098-000", Address = "Solaria Tower, Ortigas Center, Pasig City", Status = "Submitted", Remarks = (string?)null }
                }
            },
            new
            {
                ContractNo = "ITB-2026-BAC-005",
                Title = "Upgrade and Expansion of Campus-Wide High-Density Wi-Fi 7 and Fiber Backbone Infrastructure",
                ABC = 14200000.00m,
                Mode = publicBiddingMode,
                Status = "Closed",
                ScopeOfWork = "Procurement and structured deployment of 120 units Enterprise Tri-Band Wi-Fi 7 Access Points, 16 units 10G Multi-Gigabit PoE++ Distribution Switches, 2 units 100G Core Spine Switches, single-mode fiber optic underground backbone cabling, and cloud controller licenses.",
                NonRefundableFee = 25000.00m,
                DeliveryDays = 60,
                DaysPostedAgo = 60,
                DaysPreBidAgo = 50,
                DaysDeadlineAhead = -30,
                Applicants = new[]
                {
                    new { Company = "ConvergeNet Enterprise Solutions", Contact = "Gary Tan", Email = "contracts@convergenet.ph", Phone = "+63 917 777 8899", TIN = "890-123-456-000", Address = "Tech Plaza, Shaw Blvd, Mandaluyong City", Status = "Passed", Remarks = (string?)"Lowest Calculated and Responsive Bidder (LCRB). All post-qualification parameters verified responsive." },
                    new { Company = "Telecom & Data Systems Global Inc.", Contact = "Vanessa Lim", Email = "enterprise@tdsglobal.ph", Phone = "+63 920 444 7788", TIN = "234-567-890-000", Address = "Ayala Triangle Gardens, Makati City", Status = "Failed", Remarks = (string?)"Disqualified during post-qualification: SLCC equipment capacity did not meet minimum 100G spine switch threshold." }
                }
            }
        };

        foreach (var def in projectDefinitions)
        {
            var cprNumber = $"CPR-{def.ContractNo}";
            var cpr = await context.ConsolidatedPRs!.FirstOrDefaultAsync(c => c.CPRNumber == cprNumber);
            if (cpr == null)
            {
                cpr = new ConsolidatedPR
                {
                    Id = Guid.NewGuid(),
                    CPRNumber = cprNumber,
                    Description = def.Title,
                    Purpose = def.ScopeOfWork,
                    ConsolidationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-def.DaysPostedAgo)),
                    TotalAmount = def.ABC,
                    Status = StatusEnum.Approved,
                    CreatedAt = DateTime.UtcNow.AddDays(-def.DaysPostedAgo),
                    CreatedBy = "System"
                };
                await context.ConsolidatedPRs!.AddAsync(cpr);
                await context.SaveChangesAsync();
            }

            var rfqNumber = $"RFQ-{def.ContractNo}";
            var rfq = await context.RFQs!.FirstOrDefaultAsync(r => r.RFQNumber == rfqNumber);
            if (rfq == null)
            {
                rfq = new RFQ
                {
                    Id = Guid.NewGuid(),
                    RFQNumber = rfqNumber,
                    TracingNumber = $"TRC-{def.ContractNo}",
                    Description = def.Title,
                    ConsolidatedPRId = cpr.Id,
                    ModeOfProcurementId = def.Mode?.Id,
                    Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-def.DaysPostedAgo)),
                    Deadline = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(def.DaysDeadlineAhead)),
                    DeliveryPeriod = $"{def.DeliveryDays} days",
                    Purpose = def.Title,
                    Status = StatusEnum.Approved,
                    TotalAmount = def.ABC,
                    CreatedAt = DateTime.UtcNow.AddDays(-def.DaysPostedAgo),
                    CreatedBy = "System"
                };
                await context.RFQs!.AddAsync(rfq);
                await context.SaveChangesAsync();
            }
            else if (rfq.Status != StatusEnum.Approved)
            {
                rfq.Status = StatusEnum.Approved;
                context.RFQs!.Update(rfq);
                await context.SaveChangesAsync();
            }

            var project = await context.ProcurementProjects!
                .Include(p => p.BiddingDocument)
                .Include(p => p.BiddingActivitySchedules)
                .Include(p => p.ProjectDocumentChecklists)
                .FirstOrDefaultAsync(p => p.ContractNo == def.ContractNo);

            if (project == null)
            {
                project = new ProcurementProject
                {
                    Id = Guid.NewGuid(),
                    ContractNo = def.ContractNo,
                    Title = def.Title,
                    ABC = def.ABC,
                    Status = def.Status,
                    ProcurementModeId = def.Mode?.Id,
                    ConsolidatedPRId = cpr.Id,
                    ScopeOfWork = def.ScopeOfWork,
                    NonRefundableBidderFee = def.NonRefundableFee,
                    DeliveryPeriodDays = def.DeliveryDays,
                    ChecklistConfirmed = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-def.DaysPostedAgo),
                    CreatedBy = "System"
                };

                // Add Bidding Document
                project.BiddingDocument = new BiddingDocument
                {
                    Id = Guid.NewGuid(),
                    ProcurementProjectId = project.Id,
                    ProcurementCategoryId = goodsCat.Id,
                    Status = "Posted",
                    PostedAt = DateTime.UtcNow.AddDays(-def.DaysPostedAgo),
                    CreatedAt = DateTime.UtcNow.AddDays(-def.DaysPostedAgo),
                    CreatedBy = "System"
                };

                // Add Schedules
                if (actPosting != null)
                {
                    project.BiddingActivitySchedules.Add(new BiddingActivitySchedule
                    {
                        Id = Guid.NewGuid(),
                        ProcurementProjectId = project.Id,
                        ProcurementActivityTypeId = actPosting.Id,
                        StartDate = DateTime.UtcNow.AddDays(-def.DaysPostedAgo),
                        EndDate = DateTime.UtcNow.AddDays(-def.DaysPostedAgo + 7),
                        Venue = "PhilGEPS Portal & University Bulletin",
                        Status = "Completed",
                        IsLocked = true
                    });
                }

                if (actPreBid != null && def.DaysPreBidAgo > 0)
                {
                    project.BiddingActivitySchedules.Add(new BiddingActivitySchedule
                    {
                        Id = Guid.NewGuid(),
                        ProcurementProjectId = project.Id,
                        ProcurementActivityTypeId = actPreBid.Id,
                        StartDate = DateTime.UtcNow.AddDays(-def.DaysPreBidAgo),
                        EndDate = DateTime.UtcNow.AddDays(-def.DaysPreBidAgo),
                        Venue = "BAC Conference Room, 3rd Floor Admin Bldg / Zoom Video Conference",
                        Status = "Completed",
                        IsLocked = true
                    });
                }

                if (actOpening != null)
                {
                    var deadline = DateTime.UtcNow.AddDays(def.DaysDeadlineAhead);
                    project.BiddingActivitySchedules.Add(new BiddingActivitySchedule
                    {
                        Id = Guid.NewGuid(),
                        ProcurementProjectId = project.Id,
                        ProcurementActivityTypeId = actOpening.Id,
                        StartDate = deadline,
                        EndDate = deadline,
                        Venue = "BAC Bidding Hall & Live Broadcast",
                        Status = def.DaysDeadlineAhead > 0 ? "Pending" : "Completed",
                        IsLocked = def.DaysDeadlineAhead <= 0
                    });
                }

                // Add Document Checklists
                int orderIdx = 1;
                foreach (var kvp in masterDocTypeDict)
                {
                    var mType = kvp.Value;
                    project.ProjectDocumentChecklists.Add(new ProjectDocumentChecklist
                    {
                        Id = Guid.NewGuid(),
                        ProcurementProjectId = project.Id,
                        MasterDocumentTypeId = mType.Id,
                        EnvelopeType = mType.EnvelopeType,
                        IsRequired = true,
                        OrderIndex = orderIdx++
                    });
                }

                await context.ProcurementProjects!.AddAsync(project);
                await context.SaveChangesAsync();

                // Add sample supplier applications
                foreach (var app in def.Applicants)
                {
                    var supplierApp = new PublicSupplierApplication
                    {
                        Id = Guid.NewGuid(),
                        ProcurementProjectId = project.Id,
                        CompanyName = app.Company,
                        ContactPerson = app.Contact,
                        EmailAddress = app.Email,
                        ContactNumber = app.Phone,
                        TinNumber = app.TIN,
                        BusinessAddress = app.Address,
                        Status = app.Status,
                        Remarks = app.Remarks,
                        SubmittedAt = DateTime.UtcNow.AddDays(-Math.Max(1, def.DaysPostedAgo - 2)),
                        CreatedAt = DateTime.UtcNow.AddDays(-Math.Max(1, def.DaysPostedAgo - 2)),
                        CreatedBy = "PublicPortal"
                    };

                    // Add uploaded documents for checklist items
                    foreach (var checklist in project.ProjectDocumentChecklists.Take(5))
                    {
                        var docName = checklist.MasterDocumentType?.Name ?? "Required Document";
                        supplierApp.UploadedDocuments.Add(new ApplicationUploadedDocument
                        {
                            Id = Guid.NewGuid(),
                            ApplicationId = supplierApp.Id,
                            ChecklistItemId = checklist.Id,
                            OriginalFileName = $"{app.Company.Replace(" ", "_")}_{docName.Replace(" ", "_")}.pdf",
                            BlobStorageUrl = $"/documents/public_applications/{supplierApp.Id}_{checklist.Id}.pdf",
                            UploadedAt = supplierApp.SubmittedAt
                        });
                    }

                    await context.PublicSupplierApplications!.AddAsync(supplierApp);
                }

                await context.SaveChangesAsync();
            }
            else
            {
                if (project.ConsolidatedPRId == null)
                {
                    project.ConsolidatedPRId = cpr.Id;
                    context.ProcurementProjects!.Update(project);
                    await context.SaveChangesAsync();
                }
            }
        }
    }

    /// <summary>
    /// Seeds comprehensive procurement test data for Purchase Orders across SVP, Public Bidding,
    /// and Direct Acquisition, including available (unlinked) source documents and seeded POs in
    /// all workflow states (Draft, ForApproval, Approved, Returned).
    /// Safe and idempotent to run on startup or on demand.
    /// </summary>
    public static async Task SeedPurchaseOrdersAndSourceDocumentsAsync(ApplicationDbContext context, IUnitOfWork unitOfWork)
    {
        try
        {
            // 1. Resolve Prerequisites
            var itOffice = await context.Offices!.FirstOrDefaultAsync(o => o.Code == "ICTD")
                ?? await context.Offices!.FirstAsync();
            var adminOffice = await context.Offices!.FirstOrDefaultAsync(o => o.Code == "GSPD")
                ?? itOffice;
            var fundSource = await context.FundSources!.FirstOrDefaultAsync(f => f.Code == "01101101")
                ?? await context.FundSources!.FirstAsync();

            var defaultLaptopPPMP = await context.PPMPItems!.FirstOrDefaultAsync(i => i.Name.Contains("Laptop"))
                ?? await context.PPMPItems!.FirstAsync();
            var defaultPrinterPPMP = await context.PPMPItems!.FirstOrDefaultAsync(i => i.Name.Contains("Printer"))
                ?? defaultLaptopPPMP;

            var apexSupplier = await context.Suppliers!.FirstOrDefaultAsync(s => s.Name.Contains("Apex IT Solutions"))
                ?? await context.Suppliers!.FirstAsync(s => s.Status == "Approved");
            var primeOfficeSupplier = await context.Suppliers!.FirstOrDefaultAsync(s => s.Name.Contains("PrimeOffice Depot"))
                ?? await context.Suppliers!.FirstAsync(s => s.Status == "Approved");
            var bayanSupplier = await context.Suppliers!.FirstOrDefaultAsync(s => s.Name.Contains("Bayan Microtech"))
                ?? await context.Suppliers!.FirstAsync(s => s.Status == "Approved");
            var cyberTechSupplier = await context.Suppliers!.FirstOrDefaultAsync(s => s.Name.Contains("CyberTech Logistics"))
                ?? await context.Suppliers!.FirstAsync(s => s.Status == "Approved");

            var svpMode = await context.ProcurementModes!.FirstOrDefaultAsync(m => m.Name.Contains("Small Value Procurement"))
                ?? await context.ProcurementModes!.FirstAsync();
            var biddingMode = await context.ProcurementModes!.FirstOrDefaultAsync(m => m.Name.Contains("Competitive Bidding") || m.Name.Contains("Public Bidding"))
                ?? await context.ProcurementModes!.FirstAsync();

            // -------------------------------------------------------------
            // A. Small Value Procurement (SVP) Flow
            // -------------------------------------------------------------
            var cprSvpNumber = "CPR-2026-SVP-001";
            var cprSvp = await context.ConsolidatedPRs!.Include(c => c.ConsolidatedPRItems).FirstOrDefaultAsync(c => c.CPRNumber == cprSvpNumber);
            var prIct = await context.PurchaseRequests!.Include(p => p.PRItems).FirstOrDefaultAsync(p => p.PRNumber == "PR-2026-ICTD-001");

            if (cprSvp == null)
            {
                cprSvp = new ConsolidatedPR
                {
                    Id = Guid.NewGuid(),
                    CPRNumber = cprSvpNumber,
                    Description = "Consolidated PR for Workstations & Printing Systems Modernization",
                    Purpose = "Consolidated procurement of laptops and high-capacity laser printers for IT staff deployment.",
                    ConsolidationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-15)),
                    TotalAmount = 790000m,
                    Status = StatusEnum.Approved,
                    CreatedAt = DateTime.UtcNow.AddDays(-15),
                    CreatedBy = "System"
                };

                if (prIct != null)
                {
                    foreach (var prItem in prIct.PRItems)
                    {
                        cprSvp.ConsolidatedPRItems.Add(new ConsolidatedPRItem
                        {
                            Id = Guid.NewGuid(),
                            ConsolidatedPRId = cprSvp.Id,
                            PurchaseRequestId = prIct.Id,
                            PRItemId = prItem.Id,
                            ProcurementModeId = svpMode.Id,
                            AllowPartial = true
                        });
                    }
                }

                await context.ConsolidatedPRs!.AddAsync(cprSvp);
                await context.SaveChangesAsync();
            }
            else if (!cprSvp.ConsolidatedPRItems.Any() && prIct != null)
            {
                foreach (var prItem in prIct.PRItems)
                {
                    cprSvp.ConsolidatedPRItems.Add(new ConsolidatedPRItem
                    {
                        Id = Guid.NewGuid(),
                        ConsolidatedPRId = cprSvp.Id,
                        PurchaseRequestId = prIct.Id,
                        PRItemId = prItem.Id,
                        ProcurementModeId = svpMode.Id,
                        AllowPartial = true
                    });
                }
                await context.SaveChangesAsync();
            }

            var rfqSvpNumber = "RFQ-2026-SVP-001";
            var rfqSvp = await context.RFQs!.Include(r => r.RFQItems).FirstOrDefaultAsync(r => r.RFQNumber == rfqSvpNumber);
            if (rfqSvp == null)
            {
                rfqSvp = new RFQ
                {
                    Id = Guid.NewGuid(),
                    RFQNumber = rfqSvpNumber,
                    TracingNumber = "TRC-2026-SVP-001",
                    Description = "Request for Quotation - Workstations & Laser Printers",
                    ConsolidatedPRId = cprSvp.Id,
                    ModeOfProcurementId = svpMode.Id,
                    Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-12)),
                    Deadline = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-5)),
                    DeliveryPeriod = "15 calendar days",
                    Purpose = "Procure computing and printing hardware under Section 53.9",
                    Status = StatusEnum.Approved,
                    TotalAmount = 790000m,
                    CreatedAt = DateTime.UtcNow.AddDays(-12),
                    CreatedBy = "System"
                };

                foreach (var cprItem in cprSvp.ConsolidatedPRItems)
                {
                    var prItem = prIct?.PRItems.FirstOrDefault(p => p.Id == cprItem.PRItemId);
                    rfqSvp.RFQItems.Add(new RFQItem
                    {
                        Id = Guid.NewGuid(),
                        RFQId = rfqSvp.Id,
                        CPRItemId = cprItem.Id,
                        Quantity = prItem?.RequestedQuantity ?? 5,
                        UnitPriceSnapshot = prItem?.UnitCost ?? 50000m,
                        ItemNameSnapshot = prItem?.Name ?? "Procurement Item",
                        CategorySnapshot = "Goods",
                        FundSnapshot = "Regular Agency Fund",
                        IsBrochureRequired = true
                    });
                }

                await context.RFQs!.AddAsync(rfqSvp);
                await context.SaveChangesAsync();
            }
            else if (!rfqSvp.RFQItems.Any())
            {
                foreach (var cprItem in cprSvp.ConsolidatedPRItems)
                {
                    var prItem = prIct?.PRItems.FirstOrDefault(p => p.Id == cprItem.PRItemId);
                    rfqSvp.RFQItems.Add(new RFQItem
                    {
                        Id = Guid.NewGuid(),
                        RFQId = rfqSvp.Id,
                        CPRItemId = cprItem.Id,
                        Quantity = prItem?.RequestedQuantity ?? 5,
                        UnitPriceSnapshot = prItem?.UnitCost ?? 50000m,
                        ItemNameSnapshot = prItem?.Name ?? "Procurement Item",
                        CategorySnapshot = "Goods",
                        FundSnapshot = "Regular Agency Fund",
                        IsBrochureRequired = true
                    });
                }
                await context.SaveChangesAsync();
            }

            // Available AOB for "Create PO" Testing (Unlinked)
            var aobAvailable = await context.AOBs!.Include(a => a.AOBAwardedItems).FirstOrDefaultAsync(a => a.AOBNumber == "AOB-2026-SVP-001");
            if (aobAvailable == null)
            {
                aobAvailable = new AOB
                {
                    Id = Guid.NewGuid(),
                    AOBNumber = "AOB-2026-SVP-001",
                    Description = "Abstract of Bids - Workstation Laptops and Laser Printers (Winning Bid: Apex IT Solutions)",
                    AwardCriterion = BidEvaluationCriteria.LCRB,
                    AOBDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-5)),
                    OpeningDate = DateTime.UtcNow.AddDays(-7),
                    Status = StatusEnum.Approved,
                    ApprovedAt = DateTime.UtcNow.AddDays(-4),
                    Remarks = "All technical and financial bids reviewed and evaluated responsive.",
                    CreatedAt = DateTime.UtcNow.AddDays(-5),
                    CreatedBy = "System"
                };

                foreach (var rfqItem in rfqSvp.RFQItems)
                {
                    decimal unitPrice = rfqItem.ItemNameSnapshot.Contains("Laptop", StringComparison.OrdinalIgnoreCase) ? 62000m : 26500m;
                    int qty = rfqItem.Quantity;
                    aobAvailable.AOBAwardedItems.Add(new AOBAwardedItem
                    {
                        Id = Guid.NewGuid(),
                        AOBId = aobAvailable.Id,
                        RFQItemId = rfqItem.Id,
                        WinningSupplierId = apexSupplier.Id,
                        AwardedQuantity = qty,
                        AwardedUnitPrice = unitPrice,
                        TotalAwardedAmount = qty * unitPrice,
                        Score = 96.5m,
                        AwardReason = "Lowest Calculated and Responsive Quotation (LCRQ)"
                    });
                }

                await context.AOBs!.AddAsync(aobAvailable);
                await context.SaveChangesAsync();
            }
            else if (!aobAvailable.AOBAwardedItems.Any())
            {
                foreach (var rfqItem in rfqSvp.RFQItems)
                {
                    decimal unitPrice = rfqItem.ItemNameSnapshot.Contains("Laptop", StringComparison.OrdinalIgnoreCase) ? 62000m : 26500m;
                    int qty = rfqItem.Quantity;
                    aobAvailable.AOBAwardedItems.Add(new AOBAwardedItem
                    {
                        Id = Guid.NewGuid(),
                        AOBId = aobAvailable.Id,
                        RFQItemId = rfqItem.Id,
                        WinningSupplierId = apexSupplier.Id,
                        AwardedQuantity = qty,
                        AwardedUnitPrice = unitPrice,
                        TotalAwardedAmount = qty * unitPrice,
                        Score = 96.5m,
                        AwardReason = "Lowest Calculated and Responsive Quotation (LCRQ)"
                    });
                }
                await context.SaveChangesAsync();
            }

            // AOB for Draft PO
            var aobDraftSource = await context.AOBs!.Include(a => a.AOBAwardedItems).FirstOrDefaultAsync(a => a.AOBNumber == "AOB-2026-SVP-0002");
            if (aobDraftSource == null)
            {
                var firstRfqItem = rfqSvp.RFQItems.FirstOrDefault();
                aobDraftSource = new AOB
                {
                    Id = Guid.NewGuid(),
                    AOBNumber = "AOB-2026-SVP-0002",
                    Description = "Abstract of Bids - Specialized Ergonomic Workstations and Chairs",
                    AwardCriterion = BidEvaluationCriteria.LCRB,
                    AOBDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-6)),
                    OpeningDate = DateTime.UtcNow.AddDays(-8),
                    Status = StatusEnum.Approved,
                    ApprovedAt = DateTime.UtcNow.AddDays(-5),
                    CreatedAt = DateTime.UtcNow.AddDays(-6),
                    CreatedBy = "System"
                };

                if (firstRfqItem != null)
                {
                    aobDraftSource.AOBAwardedItems.Add(new AOBAwardedItem
                    {
                        Id = Guid.NewGuid(),
                        AOBId = aobDraftSource.Id,
                        RFQItemId = firstRfqItem.Id,
                        WinningSupplierId = primeOfficeSupplier.Id,
                        AwardedQuantity = 10,
                        AwardedUnitPrice = 18500m,
                        TotalAwardedAmount = 185000m,
                        Score = 94.0m,
                        AwardReason = "Lowest compliant quotation"
                    });
                }

                await context.AOBs!.AddAsync(aobDraftSource);
                await context.SaveChangesAsync();
            }

            // AOB for Returned PO
            var aobReturnedSource = await context.AOBs!.Include(a => a.AOBAwardedItems).FirstOrDefaultAsync(a => a.AOBNumber == "AOB-2026-SVP-0003");
            if (aobReturnedSource == null)
            {
                var firstRfqItem = rfqSvp.RFQItems.FirstOrDefault();
                aobReturnedSource = new AOB
                {
                    Id = Guid.NewGuid(),
                    AOBNumber = "AOB-2026-SVP-0003",
                    Description = "Abstract of Bids - Interactive Smart Displays and Wall Mounts",
                    AwardCriterion = BidEvaluationCriteria.LCRB,
                    AOBDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-10)),
                    OpeningDate = DateTime.UtcNow.AddDays(-12),
                    Status = StatusEnum.Approved,
                    ApprovedAt = DateTime.UtcNow.AddDays(-9),
                    CreatedAt = DateTime.UtcNow.AddDays(-10),
                    CreatedBy = "System"
                };

                if (firstRfqItem != null)
                {
                    aobReturnedSource.AOBAwardedItems.Add(new AOBAwardedItem
                    {
                        Id = Guid.NewGuid(),
                        AOBId = aobReturnedSource.Id,
                        RFQItemId = firstRfqItem.Id,
                        WinningSupplierId = bayanSupplier.Id,
                        AwardedQuantity = 4,
                        AwardedUnitPrice = 230000m,
                        TotalAwardedAmount = 920000m,
                        Score = 98.0m,
                        AwardReason = "Lowest calculated responsive bid"
                    });
                }

                await context.AOBs!.AddAsync(aobReturnedSource);
                await context.SaveChangesAsync();
            }

            // -------------------------------------------------------------
            // B. Public Bidding Flow
            // -------------------------------------------------------------
            var cprPbNumber = "CPR-ITB-2026-BAC-001";
            var cprPb = await context.ConsolidatedPRs!.Include(c => c.ConsolidatedPRItems).FirstOrDefaultAsync(c => c.CPRNumber == cprPbNumber);
            if (cprPb == null)
            {
                cprPb = new ConsolidatedPR
                {
                    Id = Guid.NewGuid(),
                    CPRNumber = cprPbNumber,
                    Description = "High-Performance Computing Cluster & GPU Servers for AI Research",
                    Purpose = "Procurement of multi-node GPU server cluster and high-speed InfiniBand network.",
                    ConsolidationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30)),
                    TotalAmount = 18500000m,
                    Status = StatusEnum.Approved,
                    CreatedAt = DateTime.UtcNow.AddDays(-30),
                    CreatedBy = "System"
                };
                await context.ConsolidatedPRs!.AddAsync(cprPb);
                await context.SaveChangesAsync();
            }

            if (!cprPb.ConsolidatedPRItems.Any())
            {
                var prPb = new PurchaseRequest
                {
                    Id = Guid.NewGuid(),
                    PRNumber = "PR-2026-ICTD-002",
                    Description = "AI Research GPU Compute Nodes & Storage",
                    Purpose = "Institutional AI infrastructure cluster build-out",
                    PRType = PRType.NonCSE,
                    OfficeId = itOffice.Id,
                    FundSourceId = fundSource.Id,
                    RequestedDate = new DateOnly(2026, 8, 1),
                    TotalAmount = 18500000m,
                    Status = StatusEnum.Approved,
                    CreatedAt = DateTime.UtcNow.AddDays(-28),
                    CreatedBy = "System"
                };

                var item1 = new PRItem
                {
                    Id = Guid.NewGuid(),
                    PurchaseRequestId = prPb.Id,
                    PPMPItemId = defaultLaptopPPMP.Id,
                    Name = "Multi-GPU Server Compute Nodes (Dual AMD EPYC, 4x NVIDIA H100 80GB)",
                    Description = "High-performance GPU deep learning nodes with 512GB DDR5 RAM",
                    UnitCost = 3250000m,
                    RequestedQuantity = 4,
                    Amount = 13000000m,
                    IsNonCSE = true
                };
                var item2 = new PRItem
                {
                    Id = Guid.NewGuid(),
                    PurchaseRequestId = prPb.Id,
                    PPMPItemId = defaultLaptopPPMP.Id,
                    Name = "200Gbps InfiniBand High-Speed Low-Latency Switch",
                    Description = "32-port HDR 200Gbps InfiniBand leaf-spine switch with optical cables",
                    UnitCost = 950000m,
                    RequestedQuantity = 2,
                    Amount = 1900000m,
                    IsNonCSE = true
                };
                var item3 = new PRItem
                {
                    Id = Guid.NewGuid(),
                    PurchaseRequestId = prPb.Id,
                    PPMPItemId = defaultLaptopPPMP.Id,
                    Name = "500TB High-Speed NVMe Parallel Storage Array",
                    Description = "Ultra-dense all-flash parallel file system storage appliance",
                    UnitCost = 3600000m,
                    RequestedQuantity = 1,
                    Amount = 3600000m,
                    IsNonCSE = true
                };

                prPb.PRItems.Add(item1);
                prPb.PRItems.Add(item2);
                prPb.PRItems.Add(item3);
                await context.PurchaseRequests!.AddAsync(prPb);

                cprPb.ConsolidatedPRItems.Add(new ConsolidatedPRItem { Id = Guid.NewGuid(), ConsolidatedPRId = cprPb.Id, PurchaseRequestId = prPb.Id, PRItemId = item1.Id, ProcurementModeId = biddingMode.Id });
                cprPb.ConsolidatedPRItems.Add(new ConsolidatedPRItem { Id = Guid.NewGuid(), ConsolidatedPRId = cprPb.Id, PurchaseRequestId = prPb.Id, PRItemId = item2.Id, ProcurementModeId = biddingMode.Id });
                cprPb.ConsolidatedPRItems.Add(new ConsolidatedPRItem { Id = Guid.NewGuid(), ConsolidatedPRId = cprPb.Id, PurchaseRequestId = prPb.Id, PRItemId = item3.Id, ProcurementModeId = biddingMode.Id });

                await context.SaveChangesAsync();
            }

            var pbProject = await context.ProcurementProjects!
                .Include(p => p.BACResolutions)
                .FirstOrDefaultAsync(p => p.ContractNo == "ITB-2026-BAC-001");

            if (pbProject == null)
            {
                pbProject = new ProcurementProject
                {
                    Id = Guid.NewGuid(),
                    ContractNo = "ITB-2026-BAC-001",
                    Title = "Supply, Delivery, and Installation of High-Performance Computing Cluster and GPU Servers for AI Research",
                    ABC = 18500000m,
                    Status = "Awarded",
                    ProcurementModeId = biddingMode.Id,
                    ConsolidatedPRId = cprPb.Id,
                    ScopeOfWork = "Turnkey HPC GPU computing infrastructure deployment.",
                    NonRefundableBidderFee = 25000m,
                    DeliveryPeriodDays = 60,
                    ChecklistConfirmed = true,
                    CreatedAt = DateTime.UtcNow.AddDays(-25),
                    CreatedBy = "System"
                };
                await context.ProcurementProjects!.AddAsync(pbProject);
                await context.SaveChangesAsync();
            }
            else if (pbProject.ConsolidatedPRId == null)
            {
                pbProject.ConsolidatedPRId = cprPb.Id;
                pbProject.Status = "Awarded";
                context.ProcurementProjects!.Update(pbProject);
                await context.SaveChangesAsync();
            }

            var bacResolution = await context.BACResolutions!.FirstOrDefaultAsync(b => b.ResolutionNumber == "BAC-RES-2026-001");
            if (bacResolution == null)
            {
                bacResolution = new BACResolution
                {
                    Id = Guid.NewGuid(),
                    ProcurementProjectId = pbProject.Id,
                    ResolutionNumber = "BAC-RES-2026-001",
                    ResolutionType = "Award",
                    DateResolved = DateTime.UtcNow.AddDays(-10),
                    Status = "Approved",
                    WhereasClause = "WHEREAS, the Bids and Awards Committee conducted post-qualification and verified Apex IT Solutions & Enterprise Corp. as the Lowest Calculated and Responsive Bidder (LCRB)...",
                    ResolvedLocation = "BAC Secretariat Hall, Central Office",
                    CreatedAt = DateTime.UtcNow.AddDays(-10),
                    CreatedBy = "System"
                };
                await context.BACResolutions!.AddAsync(bacResolution);
                await context.SaveChangesAsync();
            }

            // Available NOA for "Create PO" Testing (Unlinked)
            var noaAvailable = await context.NoticeOfAwards!.FirstOrDefaultAsync(n => n.NOANumber == "NOA-2026-PB-001");
            if (noaAvailable == null)
            {
                noaAvailable = new NoticeOfAward
                {
                    Id = Guid.NewGuid(),
                    NOANumber = "NOA-2026-PB-001",
                    BACResolutionId = bacResolution.Id,
                    ProcurementProjectId = pbProject.Id,
                    SupplierId = apexSupplier.Id,
                    NOADate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-7)),
                    BidDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-14)),
                    Description = "Supply, Delivery, and Installation of High-Performance Computing Cluster and GPU Servers for AI Research",
                    ProcurementType = NoticeOfAwardType.GoodsAndServices,
                    AwardedAmount = 17800000m,
                    AwardCriterion = "LCRB",
                    Status = NoticeOfAwardStatus.Approved,
                    ApprovedAt = DateTime.UtcNow.AddDays(-7),
                    IssuedAt = DateTime.UtcNow.AddDays(-6),
                    CreatedAt = DateTime.UtcNow.AddDays(-7),
                    CreatedBy = "System"
                };
                await context.NoticeOfAwards!.AddAsync(noaAvailable);
                await context.SaveChangesAsync();
            }

            // NOA for ForApproval PO
            var noaForApprovalSource = await context.NoticeOfAwards!.FirstOrDefaultAsync(n => n.NOANumber == "NOA-2026-PB-0002");
            if (noaForApprovalSource == null)
            {
                noaForApprovalSource = new NoticeOfAward
                {
                    Id = Guid.NewGuid(),
                    NOANumber = "NOA-2026-PB-0002",
                    BACResolutionId = bacResolution.Id,
                    ProcurementProjectId = pbProject.Id,
                    SupplierId = cyberTechSupplier.Id,
                    NOADate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-8)),
                    BidDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-15)),
                    Description = "Procurement of Advanced Analytical Instruments and Spectrophotometers",
                    ProcurementType = NoticeOfAwardType.GoodsAndServices,
                    AwardedAmount = 8750000m,
                    AwardCriterion = "LCRB",
                    Status = NoticeOfAwardStatus.Approved,
                    ApprovedAt = DateTime.UtcNow.AddDays(-8),
                    IssuedAt = DateTime.UtcNow.AddDays(-7),
                    CreatedAt = DateTime.UtcNow.AddDays(-8),
                    CreatedBy = "System"
                };
                await context.NoticeOfAwards!.AddAsync(noaForApprovalSource);
                await context.SaveChangesAsync();
            }

            // -------------------------------------------------------------
            // C. Direct Acquisition Flow
            // -------------------------------------------------------------
            var cprDaNumber = "CPR-2026-DA-001";
            var cprDa = await context.ConsolidatedPRs!.Include(c => c.ConsolidatedPRItems).FirstOrDefaultAsync(c => c.CPRNumber == cprDaNumber);
            if (cprDa == null)
            {
                cprDa = new ConsolidatedPR
                {
                    Id = Guid.NewGuid(),
                    CPRNumber = cprDaNumber,
                    Description = "Consolidated Emergency Office Supplies & Stationery (Direct Acquisition RA 12009)",
                    Purpose = "Urgent replenishment of administrative consumables for Central Administrative Division.",
                    ConsolidationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-8)),
                    TotalAmount = 65400m,
                    Status = StatusEnum.Approved,
                    CreatedAt = DateTime.UtcNow.AddDays(-8),
                    CreatedBy = "System"
                };

                var prDa = new PurchaseRequest
                {
                    Id = Guid.NewGuid(),
                    PRNumber = "PR-2026-GSPD-001",
                    Description = "Office Supplies & Consumables Requisition",
                    Purpose = "Direct store acquisition under RA 12009",
                    PRType = PRType.NonCSE,
                    OfficeId = adminOffice.Id,
                    FundSourceId = fundSource.Id,
                    RequestedDate = new DateOnly(2026, 8, 5),
                    TotalAmount = 65400m,
                    Status = StatusEnum.Approved,
                    CreatedAt = DateTime.UtcNow.AddDays(-8),
                    CreatedBy = "System"
                };

                var paperItem = new PRItem
                {
                    Id = Guid.NewGuid(),
                    PurchaseRequestId = prDa.Id,
                    PPMPItemId = defaultPrinterPPMP.Id,
                    Name = "A4 Multi-Purpose Copy Paper 80gsm (500 sheets/ream)",
                    Description = "High-brightness multi-purpose copy and printing paper",
                    UnitCost = 250m,
                    RequestedQuantity = 100,
                    Amount = 25000m,
                    IsNonCSE = true
                };
                var tonerItem = new PRItem
                {
                    Id = Guid.NewGuid(),
                    PurchaseRequestId = prDa.Id,
                    PPMPItemId = defaultPrinterPPMP.Id,
                    Name = "Original Black High-Yield Toner Cartridges",
                    Description = "Compatible OEM toner cartridges for office laser printers",
                    UnitCost = 4500m,
                    RequestedQuantity = 6,
                    Amount = 27000m,
                    IsNonCSE = true
                };
                var staplerItem = new PRItem
                {
                    Id = Guid.NewGuid(),
                    PurchaseRequestId = prDa.Id,
                    PPMPItemId = defaultPrinterPPMP.Id,
                    Name = "Heavy-Duty Desktop Stapler with Staples Pack",
                    Description = "100-sheet binding capacity heavy-duty metal staplers",
                    UnitCost = 1116.67m,
                    RequestedQuantity = 12,
                    Amount = 13400m,
                    IsNonCSE = true
                };

                prDa.PRItems.Add(paperItem);
                prDa.PRItems.Add(tonerItem);
                prDa.PRItems.Add(staplerItem);
                await context.PurchaseRequests!.AddAsync(prDa);

                cprDa.ConsolidatedPRItems.Add(new ConsolidatedPRItem { Id = Guid.NewGuid(), ConsolidatedPRId = cprDa.Id, PurchaseRequestId = prDa.Id, PRItemId = paperItem.Id, ProcurementModeId = svpMode.Id });
                cprDa.ConsolidatedPRItems.Add(new ConsolidatedPRItem { Id = Guid.NewGuid(), ConsolidatedPRId = cprDa.Id, PurchaseRequestId = prDa.Id, PRItemId = tonerItem.Id, ProcurementModeId = svpMode.Id });
                cprDa.ConsolidatedPRItems.Add(new ConsolidatedPRItem { Id = Guid.NewGuid(), ConsolidatedPRId = cprDa.Id, PurchaseRequestId = prDa.Id, PRItemId = staplerItem.Id, ProcurementModeId = svpMode.Id });

                await context.ConsolidatedPRs!.AddAsync(cprDa);
                await context.SaveChangesAsync();
            }

            // Available Direct Acquisition for "Create PO" Testing (Unlinked)
            var daAvailable = await context.DirectAcquisitions!.FirstOrDefaultAsync(d => d.DANumber == "DA-2026-001");
            if (daAvailable == null)
            {
                daAvailable = new DirectAcquisition
                {
                    Id = Guid.NewGuid(),
                    DANumber = "DA-2026-001",
                    ConsolidatedPRId = cprDa.Id,
                    BACProjectId = pbProject.Id,
                    TotalABC = 65400m,
                    Status = DirectAcquisitionStatusEnum.APPROVED,
                    Remarks = "Direct Acquisition approved per RA 12009 for urgent off-the-shelf purchase.",
                    CreatedAt = DateTime.UtcNow.AddDays(-5),
                    CreatedBy = "System"
                };
                await context.DirectAcquisitions!.AddAsync(daAvailable);
                await context.SaveChangesAsync();
            }
            else if (daAvailable.BACProjectId == null)
            {
                daAvailable.BACProjectId = pbProject.Id;
                await context.SaveChangesAsync();
            }

            // Direct Acquisition for Approved PO
            var daApprovedSource = await context.DirectAcquisitions!.FirstOrDefaultAsync(d => d.DANumber == "DA-2026-0002");
            if (daApprovedSource == null)
            {
                daApprovedSource = new DirectAcquisition
                {
                    Id = Guid.NewGuid(),
                    DANumber = "DA-2026-0002",
                    ConsolidatedPRId = cprDa.Id,
                    BACProjectId = pbProject.Id,
                    TotalABC = 48500m,
                    Status = DirectAcquisitionStatusEnum.APPROVED,
                    Remarks = "Direct Acquisition approved for maintenance consumables.",
                    CreatedAt = DateTime.UtcNow.AddDays(-10),
                    CreatedBy = "System"
                };
                await context.DirectAcquisitions!.AddAsync(daApprovedSource);
                await context.SaveChangesAsync();
            }
            else if (daApprovedSource.BACProjectId == null)
            {
                daApprovedSource.BACProjectId = pbProject.Id;
                await context.SaveChangesAsync();
            }

            // -------------------------------------------------------------
            // D. Pre-Seeded Purchase Orders Across Workflow States
            // -------------------------------------------------------------

            // 1. PO-2026-SVP-0001: Draft Status (SVP)
            var poSvpDraft = await context.PurchaseOrders!.Include(p => p.PurchaseOrderItems).FirstOrDefaultAsync(p => p.PONumber == "PO-2026-SVP-0001");
            if (poSvpDraft == null)
            {
                poSvpDraft = new PurchaseOrder
                {
                    Id = Guid.NewGuid(),
                    PONumber = "PO-2026-SVP-0001",
                    ProcurementMode = POProcurementModeEnum.SVP,
                    SourceDocumentType = SourceDocumentTypeEnum.AOB,
                    SourceDocumentId = aobDraftSource.Id,
                    SupplierId = primeOfficeSupplier.Id,
                    Description = "Procurement of Specialized Ergonomic Workstations and Chairs for IT Staff",
                    Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-3)),
                    PlaceOfDelivery = "ICT Division, 3rd Floor, Central Office",
                    DateOfDelivery = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(15)),
                    DeliveryTerm = "15 Calendar Days upon PO receipt",
                    PaymentTerm = "Government Net 30 Days after full delivery and inspection",
                    Status = StatusEnum.Draft,
                    TotalAmount = 185000m,
                    CreatedAt = DateTime.UtcNow.AddDays(-3),
                    CreatedBy = "System"
                };

                poSvpDraft.PurchaseOrderItems.Add(new PurchaseOrderItem
                {
                    Id = Guid.NewGuid(),
                    PurchaseOrderId = poSvpDraft.Id,
                    SourceItemId = aobDraftSource.AOBAwardedItems.FirstOrDefault()?.Id ?? Guid.NewGuid(),
                    Description = "Ergonomic High-Back Mesh Workstation Chairs with Lumbar Support",
                    Quantity = 10,
                    Unit = "unit",
                    UnitPrice = 18500m,
                    Amount = 185000m
                });

                await context.PurchaseOrders!.AddAsync(poSvpDraft);
            }

            // 2. PO-2026-PB-0001: ForApproval Status (Public Bidding)
            var poPbForApproval = await context.PurchaseOrders!.Include(p => p.PurchaseOrderItems).FirstOrDefaultAsync(p => p.PONumber == "PO-2026-PB-0001");
            if (poPbForApproval == null)
            {
                poPbForApproval = new PurchaseOrder
                {
                    Id = Guid.NewGuid(),
                    PONumber = "PO-2026-PB-0001",
                    ProcurementMode = POProcurementModeEnum.PUBLIC_BIDDING,
                    SourceDocumentType = SourceDocumentTypeEnum.NOA,
                    SourceDocumentId = noaForApprovalSource.Id,
                    SupplierId = cyberTechSupplier.Id,
                    Description = "Procurement of Advanced Analytical Instruments and Spectrophotometers",
                    Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-4)),
                    PlaceOfDelivery = "Materials Testing & Analytical Chemistry Laboratory, Building C",
                    DateOfDelivery = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(45)),
                    DeliveryTerm = "45 Calendar Days with on-site calibration",
                    PaymentTerm = "Progress Billing / Net 60 Days",
                    Status = StatusEnum.ForApproval,
                    TotalAmount = 8750000m,
                    CreatedAt = DateTime.UtcNow.AddDays(-4),
                    CreatedBy = "System"
                };

                poPbForApproval.PurchaseOrderItems.Add(new PurchaseOrderItem
                {
                    Id = Guid.NewGuid(),
                    PurchaseOrderId = poPbForApproval.Id,
                    SourceItemId = Guid.NewGuid(),
                    Description = "UV-Vis-NIR Double-Beam Research Spectrophotometer",
                    Quantity = 2,
                    Unit = "unit",
                    UnitPrice = 2500000m,
                    Amount = 5000000m
                });
                poPbForApproval.PurchaseOrderItems.Add(new PurchaseOrderItem
                {
                    Id = Guid.NewGuid(),
                    PurchaseOrderId = poPbForApproval.Id,
                    SourceItemId = Guid.NewGuid(),
                    Description = "Research-Grade FTIR Spectrometer with Diamond ATR Accessory",
                    Quantity = 1,
                    Unit = "unit",
                    UnitPrice = 3750000m,
                    Amount = 3750000m
                });

                await context.PurchaseOrders!.AddAsync(poPbForApproval);
            }

            // 3. PO-2026-DA-0001: Approved Status (Direct Acquisition)
            var poDaApproved = await context.PurchaseOrders!.Include(p => p.PurchaseOrderItems).FirstOrDefaultAsync(p => p.PONumber == "PO-2026-DA-0001");
            if (poDaApproved == null)
            {
                poDaApproved = new PurchaseOrder
                {
                    Id = Guid.NewGuid(),
                    PONumber = "PO-2026-DA-0001",
                    ProcurementMode = POProcurementModeEnum.DIRECT_ACQUISITION,
                    SourceDocumentType = SourceDocumentTypeEnum.BAC_RESOLUTION,
                    SourceDocumentId = daApprovedSource.Id,
                    SupplierId = primeOfficeSupplier.Id,
                    Description = "Direct Acquisition of Emergency Printer Maintenance Kits & Heavy-Duty Consumables",
                    Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-10)),
                    PlaceOfDelivery = "General Services Division Property Warehouse",
                    DateOfDelivery = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-5)),
                    DeliveryTerm = "Immediate / 3 Calendar Days",
                    PaymentTerm = "Cash on Delivery / Direct Disbursement Voucher",
                    Status = StatusEnum.Approved,
                    ApprovedAt = DateTime.UtcNow.AddDays(-8),
                    TotalAmount = 48500m,
                    CreatedAt = DateTime.UtcNow.AddDays(-10),
                    CreatedBy = "System"
                };

                poDaApproved.PurchaseOrderItems.Add(new PurchaseOrderItem
                {
                    Id = Guid.NewGuid(),
                    PurchaseOrderId = poDaApproved.Id,
                    SourceItemId = Guid.NewGuid(),
                    Description = "Enterprise Laser Maintenance Roller & Fuser Assembly Kit",
                    Quantity = 5,
                    Unit = "kit",
                    UnitPrice = 7500m,
                    Amount = 37500m
                });
                poDaApproved.PurchaseOrderItems.Add(new PurchaseOrderItem
                {
                    Id = Guid.NewGuid(),
                    PurchaseOrderId = poDaApproved.Id,
                    SourceItemId = Guid.NewGuid(),
                    Description = "High-Capacity Heavy-Duty Stapler Sets (5000 staples/box)",
                    Quantity = 10,
                    Unit = "set",
                    UnitPrice = 1100m,
                    Amount = 11000m
                });

                await context.PurchaseOrders!.AddAsync(poDaApproved);
            }

            // 4. PO-2026-SVP-0002: Returned Status (SVP)
            var poSvpReturned = await context.PurchaseOrders!.Include(p => p.PurchaseOrderItems).FirstOrDefaultAsync(p => p.PONumber == "PO-2026-SVP-0002");
            if (poSvpReturned == null)
            {
                poSvpReturned = new PurchaseOrder
                {
                    Id = Guid.NewGuid(),
                    PONumber = "PO-2026-SVP-0002",
                    ProcurementMode = POProcurementModeEnum.SVP,
                    SourceDocumentType = SourceDocumentTypeEnum.AOB,
                    SourceDocumentId = aobReturnedSource.Id,
                    SupplierId = bayanSupplier.Id,
                    Description = "Supply and Delivery of 86-inch Interactive Touchscreen Smart Displays",
                    Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-6)),
                    PlaceOfDelivery = "Engineering Lecture Halls, Building E",
                    DateOfDelivery = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(20)),
                    DeliveryTerm = "30 Calendar Days",
                    PaymentTerm = "Net 30 upon complete acceptance and training",
                    Status = StatusEnum.Returned,
                    ReturnReason = "Delivery schedule conflicts with semester examination week. Please revise delivery term to 45 calendar days and attach updated delivery route plan.",
                    TotalAmount = 920000m,
                    CreatedAt = DateTime.UtcNow.AddDays(-6),
                    CreatedBy = "System"
                };

                poSvpReturned.PurchaseOrderItems.Add(new PurchaseOrderItem
                {
                    Id = Guid.NewGuid(),
                    PurchaseOrderId = poSvpReturned.Id,
                    SourceItemId = aobReturnedSource.AOBAwardedItems.FirstOrDefault()?.Id ?? Guid.NewGuid(),
                    Description = "86-inch 4K UHD Interactive Touchscreen Displays with Dual OS",
                    Quantity = 4,
                    Unit = "unit",
                    UnitPrice = 230000m,
                    Amount = 920000m
                });

                await context.PurchaseOrders!.AddAsync(poSvpReturned);
            }

            await context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ProcurementTestDataSeeder ERROR] {ex.Message}");
            Console.WriteLine(ex.StackTrace);
            if (ex.InnerException != null)
            {
                Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
            }
        }
    }
}


