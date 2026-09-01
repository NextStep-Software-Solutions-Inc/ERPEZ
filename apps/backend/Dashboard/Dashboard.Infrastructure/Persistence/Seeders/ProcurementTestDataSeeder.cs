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
        var ictSupplierCat = await context.SupplierCategories!.FirstOrDefaultAsync(sc => sc.Name.Contains("Information") || sc.Name.Contains("ICT"));
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

        var officeSuppliesCat = await context.SupplierCategories!.FirstOrDefaultAsync(sc => sc.Name.Contains("Office Supplies"));
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

        var generalServicesCat = await context.SupplierCategories!.FirstOrDefaultAsync(sc => sc.Name.Contains("General Services"));
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
        var existing = await context.Suppliers!.Include(s => s.SupplierRequirements).FirstOrDefaultAsync(s => s.Name == name);
        if (existing != null)
            return;

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
}
