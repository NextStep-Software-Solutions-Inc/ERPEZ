using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using PlanningObject = ERPEZ.Domain.Entities.Planning.Object;

namespace ERPEZ.Infrastructure.Persistence.Seeders;

public static class ProcurementModuleSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // ─── 0. Targeted Clean Wipe for Target Planning, Budgeting, and Procurement Workflow Tables ───
        await WipePreviousSeedsAsync(context);

        // ─── 1. Prerequisites (Fiscal Years, Offices, Fund Sources, Object Codes, Ceilings, UOMs, Categories) ───
        await SeedPrerequisitesAsync(context);

        // ─── 1b. Master Catalog Items, Whereas Clauses, KPIs & Performance ───
        await SeedMasterCatalogAndItemsAsync(context);
        await SeedBACResolutionWhereasClausesAsync(context);
        await SeedKPIsAndPerformanceManagementAsync(context);

        // ─── 2. OPCRs (12 Records with child OPCRItems and OPCRActivities) ───
        await SeedOPCRsAsync(context);

        // ─── 3. WFPs (14 Records with child Objectives, Activities, Expenditures) ───
        await SeedWFPsAsync(context);

        // ─── 4. Line Item Budgets (12 Records with child Activities & Details) ───
        await SeedLineItemBudgetsAsync(context);

        // ─── 4b. Market Scopings ───
        await SeedMarketScopingsAsync(context);

        // ─── 5. PPMPs & PPMP Items (10 Records with 10+ child PPMPItems & Allocations) ───
        await SeedPPMPsAsync(context);

        // ─── 6. APPs (10 Records with child APPItems) ───
        await SeedAPPsAsync(context);

        // ─── 6b. Agency Procurement Requests (APRs) ───
        await SeedAPRsAsync(context);

        // ─── 7. Purchase Requests (10 Records with child PRItems) ───
        await SeedPurchaseRequestsAsync(context);

        // ─── 8. Consolidated PRs (10 Records with child ConsolidatedPRItems) ───
        await SeedConsolidatedPRsAsync(context);

        // ─── 9. Procurement Projects (10 Records linked to CPRs/APPItems) ───
        await SeedProcurementProjectsAsync(context);

        // ─── 9b. Direct Contracting ───
        await SeedDirectContractingsAsync(context);

        // ─── 10. BAC Resolutions (12 Records with Whereas Clauses) ───
        await SeedBACResolutionsAsync(context);

        // ─── 10b. Abstract of Bids (AOBs) ───
        await SeedAOBsAsync(context);

        // ─── 11. Bidding Activity Schedules (10 Records) ───
        await SeedBiddingActivitySchedulesAsync(context);

        // ─── 12. RFQs & Quotations (10 Records with child RFQItems & Suppliers) ───
        await SeedRFQsAsync(context);

        // ─── 13. Suppliers (10 Records across categories) ───
        await SeedSuppliersAsync(context);

        // ─── 14. Purchase Orders (10 Records with child POItems) ───
        await SeedPurchaseOrdersAsync(context);
    }

    private static async Task WipePreviousSeedsAsync(ApplicationDbContext context)
    {
        // Safely remove child/dependent transactional records first to prevent foreign key constraint violations
        if (context.PurchaseOrderItems != null && await context.PurchaseOrderItems.AnyAsync())
            context.PurchaseOrderItems.RemoveRange(await context.PurchaseOrderItems.ToListAsync());

        if (context.PurchaseOrders != null && await context.PurchaseOrders.AnyAsync())
            context.PurchaseOrders.RemoveRange(await context.PurchaseOrders.ToListAsync());

        if (context.BiddingActivitySchedules != null && await context.BiddingActivitySchedules.AnyAsync())
            context.BiddingActivitySchedules.RemoveRange(await context.BiddingActivitySchedules.ToListAsync());

        if (context.BACResolutions != null && await context.BACResolutions.AnyAsync())
            context.BACResolutions.RemoveRange(await context.BACResolutions.ToListAsync());

        if (context.RFQSuppliers != null && await context.RFQSuppliers.AnyAsync())
            context.RFQSuppliers.RemoveRange(await context.RFQSuppliers.ToListAsync());

        if (context.RFQItems != null && await context.RFQItems.AnyAsync())
            context.RFQItems.RemoveRange(await context.RFQItems.ToListAsync());

        if (context.RFQs != null && await context.RFQs.AnyAsync())
            context.RFQs.RemoveRange(await context.RFQs.ToListAsync());

        if (context.ProcurementProjects != null && await context.ProcurementProjects.AnyAsync())
            context.ProcurementProjects.RemoveRange(await context.ProcurementProjects.ToListAsync());

        if (context.ConsolidatedPRItems != null && await context.ConsolidatedPRItems.AnyAsync())
            context.ConsolidatedPRItems.RemoveRange(await context.ConsolidatedPRItems.ToListAsync());

        if (context.ConsolidatedPRs != null && await context.ConsolidatedPRs.AnyAsync())
            context.ConsolidatedPRs.RemoveRange(await context.ConsolidatedPRs.ToListAsync());

        if (context.PRItems != null && await context.PRItems.AnyAsync())
            context.PRItems.RemoveRange(await context.PRItems.ToListAsync());

        if (context.PurchaseRequests != null && await context.PurchaseRequests.AnyAsync())
            context.PurchaseRequests.RemoveRange(await context.PurchaseRequests.ToListAsync());

        if (context.APPItems != null && await context.APPItems.AnyAsync())
            context.APPItems.RemoveRange(await context.APPItems.ToListAsync());

        if (context.APPPPMPs != null && await context.APPPPMPs.AnyAsync())
            context.APPPPMPs.RemoveRange(await context.APPPPMPs.ToListAsync());

        if (context.APPs != null && await context.APPs.AnyAsync())
            context.APPs.RemoveRange(await context.APPs.ToListAsync());

        if (context.PPMPItemAllocations != null && await context.PPMPItemAllocations.AnyAsync())
            context.PPMPItemAllocations.RemoveRange(await context.PPMPItemAllocations.ToListAsync());

        if (context.PPMPItems != null && await context.PPMPItems.AnyAsync())
            context.PPMPItems.RemoveRange(await context.PPMPItems.ToListAsync());

        if (context.PPMPActivities != null && await context.PPMPActivities.AnyAsync())
            context.PPMPActivities.RemoveRange(await context.PPMPActivities.ToListAsync());

        if (context.PPMPExpenditureItems != null && await context.PPMPExpenditureItems.AnyAsync())
            context.PPMPExpenditureItems.RemoveRange(await context.PPMPExpenditureItems.ToListAsync());

        if (context.PPMPs != null && await context.PPMPs.AnyAsync())
            context.PPMPs.RemoveRange(await context.PPMPs.ToListAsync());

        if (context.LineItemBudgetDetails != null && await context.LineItemBudgetDetails.AnyAsync())
            context.LineItemBudgetDetails.RemoveRange(await context.LineItemBudgetDetails.ToListAsync());

        if (context.LineItemBudgetActivities != null && await context.LineItemBudgetActivities.AnyAsync())
            context.LineItemBudgetActivities.RemoveRange(await context.LineItemBudgetActivities.ToListAsync());

        if (context.LineItemBudgets != null && await context.LineItemBudgets.AnyAsync())
            context.LineItemBudgets.RemoveRange(await context.LineItemBudgets.ToListAsync());

        if (context.WFPObjectiveActivityExpenditures != null && await context.WFPObjectiveActivityExpenditures.AnyAsync())
            context.WFPObjectiveActivityExpenditures.RemoveRange(await context.WFPObjectiveActivityExpenditures.ToListAsync());

        if (context.WFPObjectiveActivities != null && await context.WFPObjectiveActivities.AnyAsync())
            context.WFPObjectiveActivities.RemoveRange(await context.WFPObjectiveActivities.ToListAsync());

        if (context.WFPObjectives != null && await context.WFPObjectives.AnyAsync())
            context.WFPObjectives.RemoveRange(await context.WFPObjectives.ToListAsync());

        if (context.WFPs != null && await context.WFPs.AnyAsync())
            context.WFPs.RemoveRange(await context.WFPs.ToListAsync());

        if (context.OPCRActivities != null && await context.OPCRActivities.AnyAsync())
            context.OPCRActivities.RemoveRange(await context.OPCRActivities.ToListAsync());

        if (context.OPCRItems != null && await context.OPCRItems.AnyAsync())
            context.OPCRItems.RemoveRange(await context.OPCRItems.ToListAsync());

        if (context.OPCRs != null && await context.OPCRs.AnyAsync())
            context.OPCRs.RemoveRange(await context.OPCRs.ToListAsync());

        await context.SaveChangesAsync();
    }

    private static async Task SeedPrerequisitesAsync(ApplicationDbContext context)
    {
        // ─── 1. Fiscal Years (2024, 2025, 2026, 2027) ───
        if (context.FiscalYears != null)
        {
            var existingFys = await context.FiscalYears.ToListAsync();
            var requiredYears = new[]
            {
                (Year: 2024, Status: "Closed", Description: "Fiscal Year 2024 (Prior Audited)"),
                (Year: 2025, Status: "Active", Description: "Fiscal Year 2025 (Prior Operational)"),
                (Year: 2026, Status: "Active", Description: "Fiscal Year 2026 (Current Operating Year)"),
                (Year: 2027, Status: "Active", Description: "Fiscal Year 2027 (Budget Planning Year)")
            };

            foreach (var fyDef in requiredYears)
            {
                if (!existingFys.Any(f => f.Year == fyDef.Year))
                {
                    context.FiscalYears.Add(new FiscalYear
                    {
                        Id = Guid.NewGuid(),
                        Year = fyDef.Year,
                        Description = fyDef.Description,
                        Status = fyDef.Status,
                        StartDate = new DateTime(fyDef.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                        EndDate = new DateTime(fyDef.Year, 12, 31, 23, 59, 59, DateTimeKind.Utc),
                        IsLocked = fyDef.Year == 2024
                    });
                }
            }
            await context.SaveChangesAsync();
        }

        // ─── 2. 10 Funding Sources ───
        if (context.FundSources != null)
        {
            var existingFs = await context.FundSources.ToListAsync();
            var fundSourceDefs = new[]
            {
                (Code: "1101101", Name: "Specific Budgets of National Government Agencies", Type: FundSourceTypeEnum.FundCluster),
                (Code: "1101111", Name: "ARMM-DepEd's GSIS Contribution", Type: FundSourceTypeEnum.FundCluster),
                (Code: "1101252", Name: "Special Shares of LGUs in the Proceeds of National Taxes", Type: FundSourceTypeEnum.FundCluster),
                (Code: "1101253", Name: "Barangay Officials Death Benefits Fund", Type: FundSourceTypeEnum.FundCluster),
                (Code: "1101254", Name: "Local Government Support Fund (formerly Financial Subsidy to LGUs)", Type: FundSourceTypeEnum.FundCluster),
                (Code: "1101255", Name: "Special Shares of LGUs in the Proceeds of Fire Code Fees", Type: FundSourceTypeEnum.FundCluster),
                (Code: "1101256", Name: "Barangay Officials Death Benefits", Type: FundSourceTypeEnum.FundCluster),
                (Code: "1101257", Name: "Bangsamoro Autonomous Region in Muslim Mindanao (BARMM)", Type: FundSourceTypeEnum.FundCluster),
                (Code: "1101276", Name: "Equity Contribution - Budgetary Support to Government Corporations", Type: FundSourceTypeEnum.FundCluster),
                (Code: "1101277", Name: "Subsidies - Budgetary Support to Government Corporations", Type: FundSourceTypeEnum.FundCluster)
            };

            foreach (var def in fundSourceDefs)
            {
                var existing = existingFs.FirstOrDefault(fs => fs.Code == def.Code);
                if (existing == null)
                {
                    context.FundSources.Add(new FundSource
                    {
                        Id = Guid.NewGuid(),
                        Code = def.Code,
                        Name = def.Name,
                        Type = def.Type,
                        IsActive = true
                    });
                }
                else
                {
                    existing.Name = def.Name;
                    existing.Type = def.Type;
                    existing.IsActive = true;
                }
            }
            await context.SaveChangesAsync();
        }

        // ─── 3. 10 Object Codes ───
        if (context.Objects != null)
        {
            var existingObjects = await context.Objects.ToListAsync();
            var objectDefs = new[]
            {
                (Code: "10101010", Name: "Cash - Collecting Officers", IsActive: true),
                (Code: "10101020", Name: "Petty Cash", IsActive: true),
                (Code: "10102010", Name: "Cash in Bank - Local Currency, Bangko Sentral ng Pilipinas", IsActive: true),
                (Code: "10102020", Name: "Cash in Bank - Local Currency, Current Account", IsActive: true),
                (Code: "10102030", Name: "Cash in Bank - Local Currency, Savings Account", IsActive: true),
                (Code: "10102040", Name: "Cash in Bank - Local Currency, Time Deposits", IsActive: false),
                (Code: "10103010", Name: "Cash in Bank - Foreign Currency, Current Account", IsActive: true),
                (Code: "10103020", Name: "Cash in Bank - Foreign Currency, Savings Account", IsActive: true),
                (Code: "10103030", Name: "Cash in Bank - Foreign Currency, Time Deposits", IsActive: true),
                (Code: "10201010", Name: "Investments in Treasury Bills", IsActive: true)
            };

            foreach (var def in objectDefs)
            {
                var existing = existingObjects.FirstOrDefault(o => o.Code == def.Code);
                if (existing == null)
                {
                    context.Objects.Add(new PlanningObject
                    {
                        Id = Guid.NewGuid(),
                        Code = def.Code,
                        Name = def.Name,
                        IsActive = def.IsActive
                    });
                }
                else
                {
                    existing.Name = def.Name;
                    existing.IsActive = def.IsActive;
                }
            }
            await context.SaveChangesAsync();
        }

        // ─── 4. Units of Measurement (UOMs) ───
        if (context.UOMs != null)
        {
            var uomList = new[] { "lot", "unit", "set", "piece", "box", "ream", "pack", "roll", "meter", "kg" };
            var existingUoms = await context.UOMs.ToListAsync();
            foreach (var uomName in uomList)
            {
                if (!existingUoms.Any(u => u.Name.Equals(uomName, StringComparison.OrdinalIgnoreCase)))
                {
                    context.UOMs.Add(new UOM
                    {
                        Id = Guid.NewGuid(),
                        Name = uomName,
                        Code = uomName.ToUpper(),
                        Description = $"{uomName} measurement unit"
                    });
                }
            }
            await context.SaveChangesAsync();
        }

        // ─── 5. Procurement Modes ───
        if (context.ProcurementModes != null)
        {
            var existingModes = await context.ProcurementModes.ToListAsync();
            var modeDefs = new[]
            {
                (Name: "Public Bidding", Min: 1000000m, Max: (decimal?)null, MinSuppliers: 1),
                (Name: "Direct Contracting", Min: 0m, Max: (decimal?)null, MinSuppliers: 1),
                (Name: "Small Value Procurement", Min: 0m, Max: (decimal?)1000000m, MinSuppliers: 3),
                (Name: "Shopping", Min: 0m, Max: (decimal?)250000m, MinSuppliers: 3),
                (Name: "Negotiated Procurement", Min: 0m, Max: (decimal?)null, MinSuppliers: 3)
            };

            foreach (var mode in modeDefs)
            {
                if (!existingModes.Any(m => m.Name == mode.Name))
                {
                    context.ProcurementModes.Add(new ProcurementMode
                    {
                        Id = Guid.NewGuid(),
                        Name = mode.Name,
                        Description = $"{mode.Name} under GPPB R.A. 9184 guidelines",
                        MinThreshold = mode.Min,
                        MaxThreshold = mode.Max,
                        MinSupplierCount = mode.MinSuppliers,
                        IsActive = true
                    });
                }
            }
            await context.SaveChangesAsync();
        }

        // ─── 6. Offices ───
        var offices = await context.Offices!.ToListAsync();

        if (context.Organizations != null && !await context.Organizations.AnyAsync())
        {
            context.Organizations.Add(new Organization
            {
                Id = Guid.NewGuid(),
                Name = "University System",
                Code = "USTP",
                Type = "University",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Seeder"
            });
        }

        if (context.Categories != null && !await context.Categories.AnyAsync())
        {
            context.Categories.Add(new Category
            {
                Id = Guid.NewGuid(),
                Name = "University Unit",
                Code = "UNIT",
                CanHaveChildren = false,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Seeder"
            });
        }

        if (context.AdministrativeLevels != null && !await context.AdministrativeLevels.AnyAsync())
        {
            context.AdministrativeLevels.Add(new AdministrativeLevel
            {
                Id = Guid.NewGuid(),
                Name = "University Level",
                Code = "UL",
                CanHaveChildren = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Seeder"
            });
        }

        if (context.OfficeTypes != null && !await context.OfficeTypes.AnyAsync())
        {
            context.OfficeTypes.Add(new OfficeType
            {
                Id = Guid.NewGuid(),
                Name = "Main Campus",
                Code = "MAIN",
                CanHaveChildren = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "Seeder"
            });
        }

        await context.SaveChangesAsync();

        var defaultOrg = await context.Organizations!.FirstOrDefaultAsync();
        var defaultCat = await context.Categories!.FirstOrDefaultAsync();
        var defaultAdminLevel = await context.AdministrativeLevels!.FirstOrDefaultAsync();
        var defaultOfficeType = await context.OfficeTypes!.FirstOrDefaultAsync();

        if (defaultOrg != null && defaultCat != null && defaultAdminLevel != null && defaultOfficeType != null)
        {
            var officeDefs = new[]
            {
                (Code: "OVCAA", Name: "Office of the Vice Chancellor for Academic Affairs"),
                (Code: "OVCR", Name: "Office of the Vice Chancellor for Research & Innovation"),
                (Code: "OVCPD", Name: "Office of the Vice Chancellor for Planning & Development"),
                (Code: "HRMO", Name: "Human Resource Management Office"),
                (Code: "ICTD", Name: "Information and Communications Technology Division"),
                (Code: "BAC-SEC", Name: "Bids and Awards Committee Secretariat"),
                (Code: "BUDGET", Name: "University Budget Management Office"),
                (Code: "CEA", Name: "College of Engineering and Architecture")
            };

            foreach (var def in officeDefs)
            {
                if (!offices.Any(o => o.Code == def.Code) && context.Offices != null)
                {
                    context.Offices.Add(new Office
                    {
                        Id = Guid.NewGuid(),
                        Code = def.Code,
                        Name = def.Name,
                        Address = "USTP Main Campus, Cagayan de Oro City",
                        Description = def.Name,
                        OrganizationId = defaultOrg.Id,
                        CategoryId = defaultCat.Id,
                        AdministrativeLevelId = defaultAdminLevel.Id,
                        OfficeTypeId = defaultOfficeType.Id
                    });
                }
            }
            await context.SaveChangesAsync();
        }

        // ─── 7. Agency Master Budgets & Office Ceilings ───
        var allFys = await context.FiscalYears!.ToListAsync();
        var allFs = await context.FundSources!.ToListAsync();
        var allOffices = await context.Offices!.ToListAsync();

        var primaryFs = allFs.FirstOrDefault(fs => fs.Code == "1101101") ?? allFs.FirstOrDefault();
        var secondaryFs = allFs.FirstOrDefault(fs => fs.Code == "1101111") ?? allFs.Skip(1).FirstOrDefault();
        var corpFs = allFs.FirstOrDefault(fs => fs.Code == "1101277") ?? allFs.Skip(2).FirstOrDefault();

        if (context.AgencyMasterBudgets != null && context.OfficeCeilings != null && primaryFs != null)
        {
            var targetFys = allFys.Where(f => f.Year >= 2025 && f.Year <= 2027).ToList();

            foreach (var fy in targetFys)
            {
                var fsList = new[] { primaryFs, secondaryFs, corpFs }.Where(x => x != null).Distinct().ToList();

                foreach (var fs in fsList)
                {
                    if (fs == null) continue;
                    var existingAmb = await context.AgencyMasterBudgets.FirstOrDefaultAsync(a => a.FiscalYearId == fy.Id && a.FundSourceId == fs.Id);
                    if (existingAmb == null)
                    {
                        var multiplier = fy.Year == 2026 ? 1.0m : (fy.Year == 2027 ? 1.15m : 0.85m);
                        existingAmb = new AgencyMasterBudget
                        {
                            Id = Guid.NewGuid(),
                            FiscalYearId = fy.Id,
                            FundSourceId = fs.Id,
                            PSAmount = 45000000m * multiplier,
                            MOOEAmount = 30000000m * multiplier,
                            COAmount = 25000000m * multiplier,
                            SourceDocumentType = "General Appropriations Act"
                        };
                        context.AgencyMasterBudgets.Add(existingAmb);
                        await context.SaveChangesAsync();
                    }

                    foreach (var off in allOffices.Take(5))
                    {
                        if (!await context.OfficeCeilings.AnyAsync(oc => oc.OfficeId == off.Id && oc.AgencyMasterBudgetId == existingAmb.Id))
                        {
                            context.OfficeCeilings.Add(new OfficeCeiling
                            {
                                Id = Guid.NewGuid(),
                                OfficeId = off.Id,
                                FiscalYearId = fy.Id,
                                AgencyMasterBudgetId = existingAmb.Id,
                                PSAmount = 6000000m,
                                MOOEAmount = 4500000m,
                                COAmount = 3500000m,
                                TargetType = "Office",
                                Status = "Approved"
                            });
                        }
                    }
                }
            }
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedOPCRsAsync(ApplicationDbContext context)
    {
        if (context.OPCRs == null) return;

        var fys = await context.FiscalYears!.ToDictionaryAsync(f => f.Year);
        var offices = await context.Offices!.ToDictionaryAsync(o => o.Code);

        var fy2026 = fys.GetValueOrDefault(2026);
        var fy2025 = fys.GetValueOrDefault(2025);
        var fy2027 = fys.GetValueOrDefault(2027);

        var ovcaa = offices.GetValueOrDefault("OVCAA");
        var ovcr = offices.GetValueOrDefault("OVCR");
        var hrmo = offices.GetValueOrDefault("HRMO");
        var ictd = offices.GetValueOrDefault("ICTD");
        var cea = offices.GetValueOrDefault("CEA");
        var ovcpd = offices.GetValueOrDefault("OVCPD");
        var bacsec = offices.GetValueOrDefault("BAC-SEC");
        var budget = offices.GetValueOrDefault("BUDGET");

        var kpiAssignment = await context.KPIAssignments!.FirstOrDefaultAsync();

        var opcrSeeds = new List<OPCR>
        {
            new OPCR { Id = Guid.NewGuid(), Name = "OVCAA Operational Plan & Performance Commitment FY 2026", Code = "OPCR-OVCAA-2026-001", OfficeId = ovcaa?.Id ?? Guid.Empty, FiscalYearId = fy2026?.Id ?? Guid.Empty, CommitmentStatus = "Approved", ReviewStatus = "Finalized", SubmittedDate = DateTime.UtcNow.AddDays(-40), ApprovedDate = DateTime.UtcNow.AddDays(-25), CommitmentPersonName = "Dr. Maria Santos", CommitmentPersonPosition = "Vice Chancellor for Academic Affairs" },
            new OPCR { Id = Guid.NewGuid(), Name = "OVCAA Performance Commitment FY 2025 (Prior Year)", Code = "OPCR-OVCAA-2025-001", OfficeId = ovcaa?.Id ?? Guid.Empty, FiscalYearId = fy2025?.Id ?? Guid.Empty, CommitmentStatus = "Approved", ReviewStatus = "Finalized", SubmittedDate = DateTime.UtcNow.AddYears(-1), ApprovedDate = DateTime.UtcNow.AddYears(-1).AddDays(10), CommitmentPersonName = "Dr. Maria Santos", CommitmentPersonPosition = "Vice Chancellor for Academic Affairs" },
            new OPCR { Id = Guid.NewGuid(), Name = "OVCAA Advanced Curriculum & Internationalization FY 2027", Code = "OPCR-OVCAA-2027-001", OfficeId = ovcaa?.Id ?? Guid.Empty, FiscalYearId = fy2027?.Id ?? Guid.Empty, CommitmentStatus = "Approved", ReviewStatus = "Finalized", SubmittedDate = DateTime.UtcNow.AddDays(-10), ApprovedDate = DateTime.UtcNow.AddDays(-2), CommitmentPersonName = "Dr. Maria Santos", CommitmentPersonPosition = "Vice Chancellor for Academic Affairs" },
            new OPCR { Id = Guid.NewGuid(), Name = "OVCR Research Commercialization & Innovation Ecosystem FY 2026", Code = "OPCR-OVCR-2026-001", OfficeId = ovcr?.Id ?? Guid.Empty, FiscalYearId = fy2026?.Id ?? Guid.Empty, CommitmentStatus = "Approved", ReviewStatus = "Finalized", SubmittedDate = DateTime.UtcNow.AddDays(-35), ApprovedDate = DateTime.UtcNow.AddDays(-20), CommitmentPersonName = "Dr. Nelson Rivera", CommitmentPersonPosition = "Vice Chancellor for Research" },
            new OPCR { Id = Guid.NewGuid(), Name = "OVCR Research Productivity & Publication Matrix FY 2025", Code = "OPCR-OVCR-2025-001", OfficeId = ovcr?.Id ?? Guid.Empty, FiscalYearId = fy2025?.Id ?? Guid.Empty, CommitmentStatus = "Approved", ReviewStatus = "Finalized", SubmittedDate = DateTime.UtcNow.AddYears(-1), ApprovedDate = DateTime.UtcNow.AddYears(-1).AddDays(15), CommitmentPersonName = "Dr. Nelson Rivera", CommitmentPersonPosition = "Vice Chancellor for Research" },
            new OPCR { Id = Guid.NewGuid(), Name = "HRMO Strategic Talent Management & Faculty Development FY 2026", Code = "OPCR-HRMO-2026-001", OfficeId = hrmo?.Id ?? Guid.Empty, FiscalYearId = fy2026?.Id ?? Guid.Empty, CommitmentStatus = "Approved", ReviewStatus = "Finalized", SubmittedDate = DateTime.UtcNow.AddDays(-30), ApprovedDate = DateTime.UtcNow.AddDays(-15), CommitmentPersonName = "Atty. Juan Dela Cruz", CommitmentPersonPosition = "Chief HR Officer" },
            new OPCR { Id = Guid.NewGuid(), Name = "ICTD Digital Infrastructure Modernization & Cyber Resilience FY 2026", Code = "OPCR-ICTD-2026-001", OfficeId = ictd?.Id ?? Guid.Empty, FiscalYearId = fy2026?.Id ?? Guid.Empty, CommitmentStatus = "Approved", ReviewStatus = "Finalized", SubmittedDate = DateTime.UtcNow.AddDays(-28), ApprovedDate = DateTime.UtcNow.AddDays(-12), CommitmentPersonName = "Engr. Roberto Reyes", CommitmentPersonPosition = "ICT Director" },
            new OPCR { Id = Guid.NewGuid(), Name = "College of Engineering Accreditation & Lab Modernization FY 2026", Code = "OPCR-CEA-2026-001", OfficeId = cea?.Id ?? Guid.Empty, FiscalYearId = fy2026?.Id ?? Guid.Empty, CommitmentStatus = "Approved", ReviewStatus = "Finalized", SubmittedDate = DateTime.UtcNow.AddDays(-24), ApprovedDate = DateTime.UtcNow.AddDays(-10), CommitmentPersonName = "Dr. Ernesto Ramos", CommitmentPersonPosition = "College Dean" },
            new OPCR { Id = Guid.NewGuid(), Name = "Draft Academic Continuing Education Framework FY 2026", Code = "OPCR-OVCPD-2026-DRAFT", OfficeId = ovcpd?.Id ?? ovcaa?.Id ?? Guid.Empty, FiscalYearId = fy2026?.Id ?? Guid.Empty, CommitmentStatus = "Draft", ReviewStatus = "Pending" },
            new OPCR { Id = Guid.NewGuid(), Name = "Submitted Intellectual Property Commercialization Plan FY 2026", Code = "OPCR-BACSEC-2026-SUBMITTED", OfficeId = bacsec?.Id ?? ovcr?.Id ?? Guid.Empty, FiscalYearId = fy2026?.Id ?? Guid.Empty, CommitmentStatus = "Submitted", ReviewStatus = "UnderReview", SubmittedDate = DateTime.UtcNow.AddDays(-5) },
            new OPCR { Id = Guid.NewGuid(), Name = "HRMO Health & Occupational Safety Performance Plan FY 2026", Code = "OPCR-BUDGET-2026-REVIEW", OfficeId = budget?.Id ?? hrmo?.Id ?? Guid.Empty, FiscalYearId = fy2026?.Id ?? Guid.Empty, CommitmentStatus = "Submitted", ReviewStatus = "UnderReview", SubmittedDate = DateTime.UtcNow.AddDays(-4) },
            new OPCR { Id = Guid.NewGuid(), Name = "College of Engineering Outcome-Based Education Delivery FY 2025", Code = "OPCR-CEA-2025-001", OfficeId = cea?.Id ?? Guid.Empty, FiscalYearId = fy2025?.Id ?? Guid.Empty, CommitmentStatus = "Approved", ReviewStatus = "Finalized", SubmittedDate = DateTime.UtcNow.AddYears(-1), ApprovedDate = DateTime.UtcNow.AddYears(-1).AddDays(20), CommitmentPersonName = "Dr. Ernesto Ramos", CommitmentPersonPosition = "College Dean" }
        };

        foreach (var opcr in opcrSeeds)
        {
            if (opcr.OfficeId == Guid.Empty || opcr.FiscalYearId == Guid.Empty) continue;

            var existsInDb = await context.OPCRs.AnyAsync(e => e.OfficeId == opcr.OfficeId && e.FiscalYearId == opcr.FiscalYearId);
            var existsInLocal = context.ChangeTracker.Entries<OPCR>()
                .Any(en => en.State != EntityState.Deleted && en.Entity.OfficeId == opcr.OfficeId && en.Entity.FiscalYearId == opcr.FiscalYearId);

            if (existsInDb || existsInLocal) continue;

            if (kpiAssignment != null && opcr.CommitmentStatus == "Approved")
            {
                var item = new OPCRItem
                {
                    Id = Guid.NewGuid(),
                    OPCRId = opcr.Id,
                    KPIAssignmentId = kpiAssignment.Id,
                    Q1Target = 25,
                    Q2Target = 25,
                    Q3Target = 25,
                    Q4Target = 25,
                    OPCRActivities = new List<OPCRActivity>
                    {
                        new OPCRActivity { Id = Guid.NewGuid(), Name = $"{opcr.Name} - Primary Execution Track", Description = "Strategic core operational activity", Budget = 550000m },
                        new OPCRActivity { Id = Guid.NewGuid(), Name = $"{opcr.Name} - Quality Assurance & Evaluation", Description = "Performance monitoring and quality standards verification", Budget = 400000m }
                    }
                };
                opcr.OPCRItems.Add(item);
            }

            context.OPCRs.Add(opcr);
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedWFPsAsync(ApplicationDbContext context)
    {
        if (context.WFPs == null) return;

        var offices = await context.Offices!.ToDictionaryAsync(o => o.Code);
        var fundSources = await context.FundSources!.ToDictionaryAsync(fs => fs.Code);
        var defaultObject = await context.Objects!.FirstOrDefaultAsync();

        var ovcaa = offices.GetValueOrDefault("OVCAA");
        var ovcr = offices.GetValueOrDefault("OVCR");
        var hrmo = offices.GetValueOrDefault("HRMO");
        var ictd = offices.GetValueOrDefault("ICTD");
        var cea = offices.GetValueOrDefault("CEA");

        var fs1101101 = fundSources.GetValueOrDefault("1101101")?.Id;
        var fs1101111 = fundSources.GetValueOrDefault("1101111")?.Id ?? fs1101101;
        var fs1101277 = fundSources.GetValueOrDefault("1101277")?.Id ?? fs1101101;

        var approvedOpcrOvcaa = await context.OPCRs!.Include(o => o.OPCRItems).ThenInclude(i => i.OPCRActivities)
            .FirstOrDefaultAsync(o => o.OfficeId == (ovcaa != null ? ovcaa.Id : Guid.Empty) && o.CommitmentStatus == "Approved");

        var wfpSeeds = new List<WFP>
        {
            new WFP { Id = Guid.NewGuid(), OfficeId = ovcaa?.Id ?? Guid.Empty, ProjectTitle = "Campus Digital Learning & Smart Classroom Upgrade FY 2026", ProjectOwner = "Dr. Maria Santos", ProjectStartDate = new DateOnly(2026, 1, 1), ProjectEndDate = new DateOnly(2026, 12, 31), ProposedBudget = 2500000m, GeneralObjective = "Upgrade 20 lecture halls into smart interactive classrooms.", Mode = ModeEnum.External, FundSourceId = fs1101101, Status = StatusEnum.Approved, SubmittedDate = DateTime.UtcNow.AddDays(-30), ApprovedDate = DateTime.UtcNow.AddDays(-15), CreatedBy = "Procurement Demo Admin" },
            new WFP { Id = Guid.NewGuid(), OfficeId = ovcaa?.Id ?? Guid.Empty, OPCRId = approvedOpcrOvcaa?.Id, ProjectTitle = "OVCAA Curriculum Alignment & OBE Accreditation Work Plan", ProjectOwner = "Dr. Maria Santos", ProjectStartDate = new DateOnly(2026, 1, 1), ProjectEndDate = new DateOnly(2026, 12, 31), ProposedBudget = 1100000m, GeneralObjective = "Fulfill OVCAA academic quality commitments.", Mode = ModeEnum.OPCR, FundSourceId = fs1101101, Status = StatusEnum.Approved, SubmittedDate = DateTime.UtcNow.AddDays(-28), ApprovedDate = DateTime.UtcNow.AddDays(-14), CreatedBy = "Procurement Demo Admin" },
            new WFP { Id = Guid.NewGuid(), OfficeId = ovcaa?.Id ?? Guid.Empty, ProjectTitle = "Academic Laboratory Instrument Acquisition FY 2025", ProjectOwner = "Dr. Maria Santos", ProjectStartDate = new DateOnly(2025, 1, 1), ProjectEndDate = new DateOnly(2025, 12, 31), ProposedBudget = 1800000m, GeneralObjective = "Prior year STEM laboratory microscope procurement.", Mode = ModeEnum.External, FundSourceId = fs1101101, Status = StatusEnum.Approved, SubmittedDate = DateTime.UtcNow.AddYears(-1), ApprovedDate = DateTime.UtcNow.AddYears(-1).AddDays(12), CreatedBy = "Procurement Demo Admin" },
            new WFP { Id = Guid.NewGuid(), OfficeId = ovcaa?.Id ?? Guid.Empty, ProjectTitle = "Global Academic Benchmarking & International Linkages FY 2027", ProjectOwner = "Dr. Maria Santos", ProjectStartDate = new DateOnly(2027, 1, 1), ProjectEndDate = new DateOnly(2027, 12, 31), ProposedBudget = 3200000m, GeneralObjective = "Establish faculty exchange pathways.", Mode = ModeEnum.External, FundSourceId = fs1101101, Status = StatusEnum.Approved, SubmittedDate = DateTime.UtcNow.AddDays(-10), ApprovedDate = DateTime.UtcNow.AddDays(-2), CreatedBy = "Procurement Demo Admin" },
            new WFP { Id = Guid.NewGuid(), OfficeId = ovcr?.Id ?? Guid.Empty, ProjectTitle = "Advanced Materials & Nanotechnology R&D Facility", ProjectOwner = "Dr. Nelson Rivera", ProjectStartDate = new DateOnly(2026, 1, 1), ProjectEndDate = new DateOnly(2026, 12, 31), ProposedBudget = 4800000m, GeneralObjective = "Procure electron microscope and cleanroom components.", Mode = ModeEnum.External, FundSourceId = fs1101111, Status = StatusEnum.Approved, SubmittedDate = DateTime.UtcNow.AddDays(-32), ApprovedDate = DateTime.UtcNow.AddDays(-18), CreatedBy = "Procurement Demo Admin" },
            new WFP { Id = Guid.NewGuid(), OfficeId = ovcr?.Id ?? Guid.Empty, ProjectTitle = "Smart Agriculture & AI Robotics Innovation Program (3-Year Institutional)", ProjectOwner = "Dr. Nelson Rivera", ProjectStartDate = new DateOnly(2026, 1, 1), ProjectEndDate = new DateOnly(2028, 12, 31), ProposedBudget = 8500000m, GeneralObjective = "Multi-year commercialization of agricultural drone telemetry.", Mode = ModeEnum.External, FundSourceId = fs1101277, Status = StatusEnum.Approved, SubmittedDate = DateTime.UtcNow.AddDays(-25), ApprovedDate = DateTime.UtcNow.AddDays(-10), CreatedBy = "Procurement Demo Admin" },
            new WFP { Id = Guid.NewGuid(), OfficeId = hrmo?.Id ?? Guid.Empty, ProjectTitle = "Faculty Competency Matrix & Leadership Development FY 2026", ProjectOwner = "Atty. Juan Dela Cruz", ProjectStartDate = new DateOnly(2026, 1, 1), ProjectEndDate = new DateOnly(2026, 12, 31), ProposedBudget = 1600000m, GeneralObjective = "University-wide leadership training series.", Mode = ModeEnum.External, FundSourceId = fs1101101, Status = StatusEnum.Approved, SubmittedDate = DateTime.UtcNow.AddDays(-22), ApprovedDate = DateTime.UtcNow.AddDays(-8), CreatedBy = "Procurement Demo Admin" },
            new WFP { Id = Guid.NewGuid(), OfficeId = ictd?.Id ?? Guid.Empty, ProjectTitle = "Campus High-Speed Fiber Backbone & Wi-Fi 6 Modernization", ProjectOwner = "Engr. Roberto Reyes", ProjectStartDate = new DateOnly(2026, 1, 1), ProjectEndDate = new DateOnly(2026, 12, 31), ProposedBudget = 3500000m, GeneralObjective = "Deploy 100 Wi-Fi 6 access points.", Mode = ModeEnum.External, FundSourceId = fs1101101, Status = StatusEnum.Approved, SubmittedDate = DateTime.UtcNow.AddDays(-20), ApprovedDate = DateTime.UtcNow.AddDays(-5), CreatedBy = "Procurement Demo Admin" },
            new WFP { Id = Guid.NewGuid(), OfficeId = ictd?.Id ?? Guid.Empty, ProjectTitle = "University Enterprise Cloud & Data Center Modernization (3-Year Program)", ProjectOwner = "Engr. Roberto Reyes", ProjectStartDate = new DateOnly(2026, 1, 1), ProjectEndDate = new DateOnly(2028, 12, 31), ProposedBudget = 12000000m, GeneralObjective = "Establish hybrid cloud data center site.", Mode = ModeEnum.External, FundSourceId = fs1101277, Status = StatusEnum.Approved, SubmittedDate = DateTime.UtcNow.AddDays(-15), ApprovedDate = DateTime.UtcNow.AddDays(-3), CreatedBy = "Procurement Demo Admin" },
            new WFP { Id = Guid.NewGuid(), OfficeId = cea?.Id ?? Guid.Empty, ProjectTitle = "Engineering Simulation Software & CAD Workstations Upgrade", ProjectOwner = "Dr. Ernesto Ramos", ProjectStartDate = new DateOnly(2026, 1, 1), ProjectEndDate = new DateOnly(2026, 12, 31), ProposedBudget = 2800000m, GeneralObjective = "Procure ANSYS network licenses and CAD workstations.", Mode = ModeEnum.External, FundSourceId = fs1101101, Status = StatusEnum.Approved, SubmittedDate = DateTime.UtcNow.AddDays(-18), ApprovedDate = DateTime.UtcNow.AddDays(-6), CreatedBy = "Procurement Demo Admin" },
            new WFP { Id = Guid.NewGuid(), OfficeId = ovcaa?.Id ?? Guid.Empty, ProjectTitle = "Draft University Digital Archive & Repository Project", ProjectOwner = "Dr. Maria Santos", ProjectStartDate = new DateOnly(2026, 1, 1), ProjectEndDate = new DateOnly(2026, 12, 31), ProposedBudget = 900000m, GeneralObjective = "Digitization of historical manuscripts.", Mode = ModeEnum.External, Status = StatusEnum.Draft, CreatedBy = "Procurement Demo Admin" },
            new WFP { Id = Guid.NewGuid(), OfficeId = ovcr?.Id ?? Guid.Empty, ProjectTitle = "Submitted Renewable Microgrid Feasibility Project", ProjectOwner = "Dr. Nelson Rivera", ProjectStartDate = new DateOnly(2026, 1, 1), ProjectEndDate = new DateOnly(2026, 12, 31), ProposedBudget = 1500000m, GeneralObjective = "Feasibility for solar grid tie.", Mode = ModeEnum.External, Status = StatusEnum.Submitted, SubmittedDate = DateTime.UtcNow.AddDays(-2), CreatedBy = "Procurement Demo Admin" },
            new WFP { Id = Guid.NewGuid(), OfficeId = hrmo?.Id ?? Guid.Empty, ProjectTitle = "Returned HR Onboarding Automation System", ProjectOwner = "Atty. Juan Dela Cruz", ProjectStartDate = new DateOnly(2026, 1, 1), ProjectEndDate = new DateOnly(2026, 12, 31), ProposedBudget = 750000m, GeneralObjective = "Electronic PDS submission.", Mode = ModeEnum.External, Status = StatusEnum.Returned, CreatedBy = "Procurement Demo Admin" },
            new WFP { Id = Guid.NewGuid(), OfficeId = cea?.Id ?? Guid.Empty, ProjectTitle = "CEA Mechatronics Lab Modernization FY 2025", ProjectOwner = "Dr. Ernesto Ramos", ProjectStartDate = new DateOnly(2025, 1, 1), ProjectEndDate = new DateOnly(2025, 12, 31), ProposedBudget = 2100000m, GeneralObjective = "Prior year PLC training benches.", Mode = ModeEnum.External, FundSourceId = fs1101101, Status = StatusEnum.Approved, SubmittedDate = DateTime.UtcNow.AddYears(-1), ApprovedDate = DateTime.UtcNow.AddYears(-1).AddDays(14), CreatedBy = "Procurement Demo Admin" }
        };

        foreach (var wfp in wfpSeeds)
        {
            if (wfp.OfficeId == Guid.Empty) continue;

            if (wfp.Status == StatusEnum.Approved)
            {
                var obj = new WFPObjective
                {
                    Id = Guid.NewGuid(),
                    WFPId = wfp.Id,
                    Description = $"{wfp.ProjectTitle} - Core Objective",
                    Weight = 100m
                };

                var act1 = new WFPObjectiveActivity
                {
                    Id = Guid.NewGuid(),
                    WFPId = wfp.Id,
                    WFPObjectiveId = obj.Id,
                    ActivityName = "Phase 1: Technical Procurement & Specification Validation",
                    Indicator = "100% compliant technical specifications",
                    Weight = 60m
                };

                var act2 = new WFPObjectiveActivity
                {
                    Id = Guid.NewGuid(),
                    WFPId = wfp.Id,
                    WFPObjectiveId = obj.Id,
                    ActivityName = "Phase 2: Deployment, Acceptance Testing & Commissioning",
                    Indicator = "End-user operational sign-off",
                    Weight = 40m
                };

                if (defaultObject != null)
                {
                    act1.WFPObjectiveActivityExpenditures.Add(new WFPObjectiveActivityExpenditure
                    {
                        Id = Guid.NewGuid(),
                        WFPObjectiveActivityId = act1.Id,
                        ObjectId = defaultObject.Id,
                        ItemDescription = "Primary Equipment / System Package Component",
                        Quantity = 10,
                        UnitCost = wfp.ProposedBudget * 0.05m
                    });
                }

                obj.WFPObjectiveActivities.Add(act1);
                obj.WFPObjectiveActivities.Add(act2);
                wfp.WFPObjectives.Add(obj);
            }

            context.WFPs.Add(wfp);
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedLineItemBudgetsAsync(ApplicationDbContext context)
    {
        if (context.LineItemBudgets == null) return;

        var fys = await context.FiscalYears!.ToDictionaryAsync(f => f.Year);
        var fundSources = await context.FundSources!.ToDictionaryAsync(fs => fs.Code);
        var offices = await context.Offices!.ToDictionaryAsync(o => o.Code);
        var defaultObject = await context.Objects!.FirstOrDefaultAsync();

        var fy2026 = fys.GetValueOrDefault(2026);

        var ovcaa = offices.GetValueOrDefault("OVCAA");
        var ovcr = offices.GetValueOrDefault("OVCR");
        var hrmo = offices.GetValueOrDefault("HRMO");
        var ictd = offices.GetValueOrDefault("ICTD");
        var cea = offices.GetValueOrDefault("CEA");

        var fs1101101 = fundSources.GetValueOrDefault("1101101");
        var fs1101111 = fundSources.GetValueOrDefault("1101111") ?? fs1101101;
        var fs1101277 = fundSources.GetValueOrDefault("1101277") ?? fs1101101;

        var amb2026 = await context.AgencyMasterBudgets!.FirstOrDefaultAsync(a => a.FiscalYearId == (fy2026 != null ? fy2026.Id : Guid.Empty));
        var opcrOvcaa = await context.OPCRs!.FirstOrDefaultAsync(o => o.Code == "OPCR-OVCAA-2026-001");
        var opcrOvcr = await context.OPCRs!.FirstOrDefaultAsync(o => o.Code == "OPCR-OVCR-2026-001");

        var wfpOvcaaSmart = await context.WFPs!.FirstOrDefaultAsync(w => w.ProjectTitle == "Campus Digital Learning & Smart Classroom Upgrade FY 2026");
        var wfpIctdBackbone = await context.WFPs!.FirstOrDefaultAsync(w => w.ProjectTitle == "Campus High-Speed Fiber Backbone & Wi-Fi 6 Modernization");
        var wfpIctdMulti = await context.WFPs!.FirstOrDefaultAsync(w => w.ProjectTitle == "University Enterprise Cloud & Data Center Modernization (3-Year Program)");
        var wfpOvcrRobotics = await context.WFPs!.FirstOrDefaultAsync(w => w.ProjectTitle == "Smart Agriculture & AI Robotics Innovation Program (3-Year Institutional)");
        var wfpCeaSim = await context.WFPs!.FirstOrDefaultAsync(w => w.ProjectTitle == "Engineering Simulation Software & CAD Workstations Upgrade");

        var seedLibs = new List<LineItemBudget>
        {
            new LineItemBudget { Id = Guid.NewGuid(), FiscalYearId = fy2026?.Id, FundSourceId = fs1101101?.Id, OfficeId = ovcaa?.Id, AgencyMasterBudgetId = amb2026?.Id, SourceType = "OPCR", SourceId = opcrOvcaa?.Id, Scope = "Activity", Level = "Office", LIBNumber = "LIB-OVCAA-2026-TD-001", Name = "OPCR Academic Operations Top-Down Budget FY 2026", Status = "Approved", Version = 1 },
            new LineItemBudget { Id = Guid.NewGuid(), FiscalYearId = fy2026?.Id, FundSourceId = fs1101101?.Id, OfficeId = ovcaa?.Id, AgencyMasterBudgetId = amb2026?.Id, SourceType = "OPCR", SourceId = opcrOvcaa?.Id, Scope = "Activity", Level = "Office", LIBNumber = "LIB-OVCAA-2026-TD-DRAFT", Name = "OPCR Specialized Programs Ceiling Draft Budget FY 2026", Status = "Draft", Version = 1 },
            new LineItemBudget { Id = Guid.NewGuid(), FiscalYearId = fy2026?.Id, FundSourceId = fs1101111?.Id, OfficeId = ovcaa?.Id, SourceType = "OPCR", SourceId = opcrOvcaa?.Id, Scope = "Activity", Level = "Office", LIBNumber = "LIB-OVCAA-2026-BU-001", Name = "Academic Excellence Bottom-Up Budget Proposal FY 2026", Status = "Proposed", Version = 1 },
            new LineItemBudget { Id = Guid.NewGuid(), FiscalYearId = fy2026?.Id, FundSourceId = fs1101111?.Id, OfficeId = ovcr?.Id, SourceType = "OPCR", SourceId = opcrOvcr?.Id, Scope = "Activity", Level = "Office", LIBNumber = "LIB-OVCR-2026-BU-001", Name = "Advanced Research Grant Commercialization Budget FY 2026", Status = "Approved", Version = 1 },
            new LineItemBudget { Id = Guid.NewGuid(), FiscalYearId = fy2026?.Id, FundSourceId = fs1101101?.Id, OfficeId = ictd?.Id, AgencyMasterBudgetId = amb2026?.Id, SourceType = "WFP", SourceId = wfpIctdBackbone?.Id, Scope = "Activity", Level = "Office", LIBNumber = "LIB-ICTD-WFP-2026-WIFI", Name = "Campus Wi-Fi & Fiber Backbone Activity Level Budget FY 2026", Status = "Approved", Version = 1 },
            new LineItemBudget { Id = Guid.NewGuid(), FiscalYearId = fy2026?.Id, FundSourceId = fs1101101?.Id, OfficeId = ictd?.Id, AgencyMasterBudgetId = amb2026?.Id, SourceType = "WFP", SourceId = wfpIctdBackbone?.Id, Scope = "Activity", Level = "Office", LIBNumber = "LIB-ICTD-WFP-2026-DRAFT", Name = "Network Security & Firewall Redundancy Draft Budget", Status = "Draft", Version = 1 },
            new LineItemBudget { Id = Guid.NewGuid(), FiscalYearId = null, FundSourceId = fs1101277?.Id, OfficeId = ictd?.Id, SourceType = "WFP", SourceId = wfpIctdMulti?.Id, Scope = "Activity", Level = "Office", LIBNumber = "LIB-ICTD-WFP-2026-2028-CLOUD", Name = "University Enterprise Cloud Multi-Year Proposal (2026-2028)", Status = "Proposed", Version = 1 },
            new LineItemBudget { Id = Guid.NewGuid(), FiscalYearId = null, FundSourceId = fs1101277?.Id, OfficeId = ovcr?.Id, SourceType = "WFP", SourceId = wfpOvcrRobotics?.Id, Scope = "Activity", Level = "Office", LIBNumber = "LIB-OVCR-WFP-2026-2028-ROBOTICS", Name = "Smart Agriculture Robotics Multi-Year Approved Budget (2026-2028)", Status = "Approved", Version = 1 },
            new LineItemBudget { Id = Guid.NewGuid(), FiscalYearId = fy2026?.Id, FundSourceId = fs1101101?.Id, OfficeId = ovcaa?.Id, AgencyMasterBudgetId = amb2026?.Id, SourceType = "WFP", SourceId = wfpOvcaaSmart?.Id, Scope = "Project", Level = "Office", LIBNumber = "LIB-OVCAA-WFP-PRJ-2026", Name = "Smart Classrooms Project-Level Consolidated Budget FY 2026", Status = "Approved", Version = 1 },
            new LineItemBudget { Id = Guid.NewGuid(), FiscalYearId = fy2026?.Id, FundSourceId = fs1101101?.Id, OfficeId = cea?.Id, AgencyMasterBudgetId = amb2026?.Id, SourceType = "WFP", SourceId = wfpCeaSim?.Id, Scope = "Project", Level = "Office", LIBNumber = "LIB-CEA-WFP-PRJ-2026", Name = "Engineering Simulation Lab Project-Level Budget FY 2026", Status = "Draft", Version = 1 },
            new LineItemBudget { Id = Guid.NewGuid(), FiscalYearId = fy2026?.Id, FundSourceId = fs1101101?.Id, OfficeId = ovcaa?.Id, SourceType = "OPCR", SourceId = opcrOvcaa?.Id, Scope = "Activity", Level = "Office", LIBNumber = "LIB-OVCAA-2026-CONSOLIDATED", Name = "Consolidated Academic Operations & Infrastructure Budget FY 2026", Status = "Consolidated", Version = 1 },
            new LineItemBudget { Id = Guid.NewGuid(), FiscalYearId = fy2026?.Id, FundSourceId = fs1101101?.Id, OfficeId = hrmo?.Id, AgencyMasterBudgetId = amb2026?.Id, SourceType = "Independent", Scope = "Activity", Level = "Office", LIBNumber = "LIB-HRMO-2026-STANDALONE", Name = "HR Institutional Training & Wellness Budget FY 2026", Status = "Approved", Version = 1 }
        };

        foreach (var lib in seedLibs)
        {
            if (lib.OfficeId == null) continue;

            var act = new LineItemBudgetActivity
            {
                Id = Guid.NewGuid(),
                LineItemBudgetId = lib.Id,
                Name = $"{lib.Name} - Main Activity Track"
            };

            if (defaultObject != null)
            {
                act.LineItemBudgetDetails.Add(new LineItemBudgetDetail
                {
                    Id = Guid.NewGuid(),
                    LineItemBudgetId = lib.Id,
                    LineItemBudgetActivityId = act.Id,
                    ObjectId = defaultObject.Id,
                    Description = "Procurement allocation for designated activity requirements",
                    Budget = 750000m,
                    TimelineType = "Quarterly"
                });
            }

            lib.LineItemBudgetActivities.Add(act);
            context.LineItemBudgets.Add(lib);
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedPPMPsAsync(ApplicationDbContext context)
    {
        if (context.PPMPs == null) return;

        var fys = await context.FiscalYears!.ToDictionaryAsync(f => f.Year);
        var offices = await context.Offices!.ToDictionaryAsync(o => o.Code);
        var fundSources = await context.FundSources!.ToDictionaryAsync(fs => fs.Code);
        var libs = await context.LineItemBudgets!.ToListAsync();
        var procModes = await context.ProcurementModes!.ToListAsync();
        var defaultObject = await context.Objects!.FirstOrDefaultAsync();

        var defaultMode = procModes.FirstOrDefault(m => m.Name == "Public Bidding") ?? procModes.FirstOrDefault();
        var svpMode = procModes.FirstOrDefault(m => m.Name == "Small Value Procurement") ?? defaultMode;

        var fy2026 = fys.GetValueOrDefault(2026);
        var fy2025 = fys.GetValueOrDefault(2025);
        var fy2027 = fys.GetValueOrDefault(2027);

        var ovcaa = offices.GetValueOrDefault("OVCAA");
        var ovcr = offices.GetValueOrDefault("OVCR");
        var hrmo = offices.GetValueOrDefault("HRMO");
        var ictd = offices.GetValueOrDefault("ICTD");
        var cea = offices.GetValueOrDefault("CEA");

        var fs1101101 = fundSources.GetValueOrDefault("1101101");
        var defaultLib = libs.FirstOrDefault();
        var defaultLibActivity = await context.LineItemBudgetActivities!.FirstOrDefaultAsync();

        var ppmpSeeds = new List<PPMP>
        {
            new PPMP { Id = Guid.NewGuid(), OfficeId = ovcaa?.Id ?? Guid.Empty, FiscalYearId = fy2026?.Id ?? Guid.Empty, FundSourceId = fs1101101?.Id, LIBId = defaultLib?.Id, PPMPNumber = "PPMP-OVCAA-2026-001", Description = "Academic Instructional Supplies & Equipment FY 2026", IsFinal = true, IsMaster = true, TotalEstimatedBudget = 3500000m, Status = StatusEnum.Approved },
            new PPMP { Id = Guid.NewGuid(), OfficeId = ovcaa?.Id ?? Guid.Empty, FiscalYearId = fy2025?.Id ?? Guid.Empty, FundSourceId = fs1101101?.Id, LIBId = defaultLib?.Id, PPMPNumber = "PPMP-OVCAA-2025-001", Description = "Academic Supplies Prior Year FY 2025", IsFinal = true, TotalEstimatedBudget = 2800000m, Status = StatusEnum.Approved },
            new PPMP { Id = Guid.NewGuid(), OfficeId = ovcaa?.Id ?? Guid.Empty, FiscalYearId = fy2027?.Id ?? Guid.Empty, FundSourceId = fs1101101?.Id, LIBId = defaultLib?.Id, PPMPNumber = "PPMP-OVCAA-2027-001", Description = "Indicative Academic Procurement Plan FY 2027", IsFinal = false, TotalEstimatedBudget = 4200000m, Status = StatusEnum.Draft },
            new PPMP { Id = Guid.NewGuid(), OfficeId = ovcr?.Id ?? Guid.Empty, FiscalYearId = fy2026?.Id ?? Guid.Empty, FundSourceId = fs1101101?.Id, LIBId = defaultLib?.Id, PPMPNumber = "PPMP-OVCR-2026-001", Description = "Research Lab Consumables & Specialized Kits FY 2026", IsFinal = true, IsMaster = true, TotalEstimatedBudget = 5200000m, Status = StatusEnum.Approved },
            new PPMP { Id = Guid.NewGuid(), OfficeId = hrmo?.Id ?? Guid.Empty, FiscalYearId = fy2026?.Id ?? Guid.Empty, FundSourceId = fs1101101?.Id, LIBId = defaultLib?.Id, PPMPNumber = "PPMP-HRMO-2026-001", Description = "HR Training Packages & Office Furniture FY 2026", IsFinal = true, TotalEstimatedBudget = 1400000m, Status = StatusEnum.Approved },
            new PPMP { Id = Guid.NewGuid(), OfficeId = ictd?.Id ?? Guid.Empty, FiscalYearId = fy2026?.Id ?? Guid.Empty, FundSourceId = fs1101101?.Id, LIBId = defaultLib?.Id, PPMPNumber = "PPMP-ICTD-2026-001", Description = "IT Hardware, Network Cabling & Server Spares FY 2026", IsFinal = true, IsMaster = true, TotalEstimatedBudget = 4800000m, Status = StatusEnum.Approved },
            new PPMP { Id = Guid.NewGuid(), OfficeId = cea?.Id ?? Guid.Empty, FiscalYearId = fy2026?.Id ?? Guid.Empty, FundSourceId = fs1101101?.Id, LIBId = defaultLib?.Id, PPMPNumber = "PPMP-CEA-2026-001", Description = "Engineering Workshop Tools & Safety Equipment FY 2026", IsFinal = true, TotalEstimatedBudget = 2900000m, Status = StatusEnum.Approved },
            new PPMP { Id = Guid.NewGuid(), OfficeId = ovcr?.Id ?? Guid.Empty, FiscalYearId = fy2026?.Id ?? Guid.Empty, FundSourceId = fs1101101?.Id, LIBId = defaultLib?.Id, PPMPNumber = "PPMP-OVCR-2026-DRAFT", Description = "Innovation Grant Equipment Draft PPMP FY 2026", IsFinal = false, TotalEstimatedBudget = 1100000m, Status = StatusEnum.Draft },
            new PPMP { Id = Guid.NewGuid(), OfficeId = ictd?.Id ?? Guid.Empty, FiscalYearId = fy2026?.Id ?? Guid.Empty, FundSourceId = fs1101101?.Id, LIBId = defaultLib?.Id, PPMPNumber = "PPMP-ICTD-2026-SUBMITTED", Description = "Cybersecurity Appliance Package Submitted PPMP", IsFinal = false, TotalEstimatedBudget = 2200000m, Status = StatusEnum.Submitted },
            new PPMP { Id = Guid.NewGuid(), OfficeId = cea?.Id ?? Guid.Empty, FiscalYearId = fy2025?.Id ?? Guid.Empty, FundSourceId = fs1101101?.Id, LIBId = defaultLib?.Id, PPMPNumber = "PPMP-CEA-2025-001", Description = "CEA Hydraulics Lab Consumables FY 2025", IsFinal = true, TotalEstimatedBudget = 1750000m, Status = StatusEnum.Approved }
        };

        foreach (var ppmp in ppmpSeeds)
        {
            if (ppmp.OfficeId == Guid.Empty || ppmp.FiscalYearId == Guid.Empty) continue;

            if (defaultLibActivity != null)
            {
                var act = new PPMPActivity
                {
                    Id = Guid.NewGuid(),
                    PPMPId = ppmp.Id,
                    LIBActivityId = defaultLibActivity.Id
                };
                ppmp.PPMPActivities.Add(act);
            }

            var expItem = new PPMPExpenditureItem
            {
                Id = Guid.NewGuid(),
                PPMPId = ppmp.Id,
                ObjectId = defaultObject?.Id ?? Guid.Empty,
                IsProcurable = true,
                TotalCost = ppmp.TotalEstimatedBudget
            };

            var modeForPpmp = ppmp.TotalEstimatedBudget > 3000000m ? (defaultMode?.Id ?? Guid.Empty) : (svpMode?.Id ?? Guid.Empty);
            var item1 = new PPMPItem
            {
                Id = Guid.NewGuid(),
                PPMPExpenditureItemId = expItem.Id,
                ProcurementModeId = modeForPpmp,
                Name = $"{ppmp.Description} - Primary Package",
                Description = $"Detailed specifications for {ppmp.Description}",
                Unit = "lot",
                UnitPrice = ppmp.TotalEstimatedBudget * 0.7m,
                PAPCode = "100000100001000",
                ProjectType = ProcurementProjectType.Goods,
                ProcurementStartDate = new DateOnly(2026, 2, 1),
                ProcurementEndDate = new DateOnly(2026, 4, 30),
                ExpectedDeliveryStart = new DateOnly(2026, 5, 1),
                ExpectedDeliveryEnd = new DateOnly(2026, 6, 30)
            };
            item1.PPMPItemAllocations.Add(new PPMPItemAllocation { Id = Guid.NewGuid(), PPMPItemId = item1.Id, AllocationMonth = AllocationMonthEnum.January, Quantity = 1 });
            expItem.PPMPItems.Add(item1);

            var item2 = new PPMPItem
            {
                Id = Guid.NewGuid(),
                PPMPExpenditureItemId = expItem.Id,
                ProcurementModeId = svpMode?.Id ?? modeForPpmp,
                Name = $"{ppmp.Description} - Consumables & Accessories",
                Description = $"Auxiliary supplies for {ppmp.Description}",
                Unit = "set",
                UnitPrice = ppmp.TotalEstimatedBudget * 0.3m,
                PAPCode = "100000100001000",
                ProjectType = ProcurementProjectType.Goods,
                ProcurementStartDate = new DateOnly(2026, 3, 1),
                ProcurementEndDate = new DateOnly(2026, 5, 31),
                ExpectedDeliveryStart = new DateOnly(2026, 6, 1),
                ExpectedDeliveryEnd = new DateOnly(2026, 7, 31)
            };
            item2.PPMPItemAllocations.Add(new PPMPItemAllocation { Id = Guid.NewGuid(), PPMPItemId = item2.Id, AllocationMonth = AllocationMonthEnum.February, Quantity = 1 });
            expItem.PPMPItems.Add(item2);

            ppmp.PPMPExpenditureItems.Add(expItem);
            context.PPMPs.Add(ppmp);
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedAPPsAsync(ApplicationDbContext context)
    {
        if (context.APPs == null) return;

        var fys = await context.FiscalYears!.ToDictionaryAsync(f => f.Year);
        var offices = await context.Offices!.ToDictionaryAsync(o => o.Code);
        var fundSources = await context.FundSources!.ToListAsync();
        var defaultFs = fundSources.FirstOrDefault();
        var procModes = await context.ProcurementModes!.ToListAsync();
        var defaultMode = procModes.FirstOrDefault();
        var ppmpItems = await context.PPMPItems!.ToListAsync();

        var fy2026 = fys.GetValueOrDefault(2026);
        var fy2025 = fys.GetValueOrDefault(2025);
        var fy2027 = fys.GetValueOrDefault(2027);

        var appSeeds = new List<APP>
        {
            new APP { Id = Guid.NewGuid(), APPNumber = "APP-2026-CSE-001", Name = "Annual Procurement Plan for Common-Use Supplies (APP-CSE) FY 2026", FiscalYearId = fy2026?.Id ?? Guid.Empty, APPType = "Final", IsFinal = "Final", Status = StatusEnum.Approved, Description = "Consolidated mandatory PS-DBM common-use goods." },
            new APP { Id = Guid.NewGuid(), APPNumber = "APP-2026-NONCSE-001", Name = "Annual Procurement Plan for Non-Common Use Goods & Civil Works FY 2026", FiscalYearId = fy2026?.Id ?? Guid.Empty, APPType = "Final", IsFinal = "Final", Status = StatusEnum.Approved, Description = "University-wide non-CSE procurement plan." },
            new APP { Id = Guid.NewGuid(), APPNumber = "APP-2026-SUPPLEMENTAL-01", Name = "Supplemental Annual Procurement Plan No. 1 FY 2026", FiscalYearId = fy2026?.Id ?? Guid.Empty, APPType = "Updated", IsFinal = "Final", Status = StatusEnum.Approved, Description = "Mid-year academic and research emergency allocations." },
            new APP { Id = Guid.NewGuid(), APPNumber = "APP-2025-CSE-001", Name = "Annual Procurement Plan for Common-Use Supplies FY 2025 (Audited)", FiscalYearId = fy2025?.Id ?? Guid.Empty, APPType = "Final", IsFinal = "Final", Status = StatusEnum.Approved, Description = "Prior year audited CSE plan." },
            new APP { Id = Guid.NewGuid(), APPNumber = "APP-2025-NONCSE-001", Name = "Annual Procurement Plan for Non-CSE Goods FY 2025 (Audited)", FiscalYearId = fy2025?.Id ?? Guid.Empty, APPType = "Final", IsFinal = "Final", Status = StatusEnum.Approved, Description = "Prior year non-CSE plan." },
            new APP { Id = Guid.NewGuid(), APPNumber = "APP-2027-INDICATIVE-001", Name = "Indicative Annual Procurement Plan FY 2027", FiscalYearId = fy2027?.Id ?? Guid.Empty, APPType = "Indicative", IsFinal = "Indicative", Status = StatusEnum.Draft, Description = "National Expenditure Program (NEP) aligned preliminary APP." },
            new APP { Id = Guid.NewGuid(), APPNumber = "APP-2026-INFRA-001", Name = "Annual Procurement Plan for Infrastructure & Capital Outlay FY 2026", FiscalYearId = fy2026?.Id ?? Guid.Empty, APPType = "Final", IsFinal = "Final", Status = StatusEnum.Approved, Description = "Civil works and building engineering package." },
            new APP { Id = Guid.NewGuid(), APPNumber = "APP-2026-CONSULTING-001", Name = "Annual Procurement Plan for Consulting & Architectural Services FY 2026", FiscalYearId = fy2026?.Id ?? Guid.Empty, APPType = "Final", IsFinal = "Final", Status = StatusEnum.Approved, Description = "Highly technical advisory and design consultancy services." },
            new APP { Id = Guid.NewGuid(), APPNumber = "APP-2026-RND-001", Name = "Annual Procurement Plan for Research & Innovation Grants FY 2026", FiscalYearId = fy2026?.Id ?? Guid.Empty, APPType = "Final", IsFinal = "Final", Status = StatusEnum.Approved, Description = "DOST-funded specialized research procurement." },
            new APP { Id = Guid.NewGuid(), APPNumber = "APP-2026-DRAFT-002", Name = "Supplemental Annual Procurement Plan No. 2 (Pending Review)", FiscalYearId = fy2026?.Id ?? Guid.Empty, APPType = "Indicative", IsFinal = "Draft", Status = StatusEnum.Draft, Description = "Second semester lab supplies adjustment." }
        };

        var bacSecOffice = offices.GetValueOrDefault("BAC-SEC") ?? offices.Values.FirstOrDefault();

        foreach (var app in appSeeds)
        {
            if (app.FiscalYearId == Guid.Empty) continue;

            if (ppmpItems.Count > 0 && defaultFs != null && defaultMode != null && bacSecOffice != null)
            {
                var ppmpItem = ppmpItems[appSeeds.IndexOf(app) % ppmpItems.Count];
                var appItem = new APPItem
                {
                    Id = Guid.NewGuid(),
                    APPId = app.Id,
                    PPMPItemId = ppmpItem.Id,
                    ProcurementModeId = ppmpItem.ProcurementModeId != Guid.Empty ? ppmpItem.ProcurementModeId : defaultMode.Id,
                    FundSourceId = defaultFs.Id,
                    OfficeId = bacSecOffice.Id,
                    PAPCode = ppmpItem.PAPCode ?? "100000100001000",
                    Remarks = $"Included in {app.APPNumber}"
                };
                app.APPItems.Add(appItem);
            }

            context.APPs.Add(app);
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedPurchaseRequestsAsync(ApplicationDbContext context)
    {
        if (context.PurchaseRequests == null) return;

        var offices = await context.Offices!.ToListAsync();
        var fundSources = await context.FundSources!.ToListAsync();
        var ppmps = await context.PPMPs!.Include(p => p.PPMPExpenditureItems).ThenInclude(e => e.PPMPItems).ToListAsync();
        var defaultOffice = offices.FirstOrDefault();
        var defaultFs = fundSources.FirstOrDefault();

        var prSeeds = new List<PurchaseRequest>
        {
            new PurchaseRequest { Id = Guid.NewGuid(), PRNumber = "PR-2026-OVCAA-001", Description = "PR for Academic Workstations and Projectors", Purpose = "Instructional lab modernization", PRType = PRType.NonCSE, RequestedDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-40)), TotalAmount = 2500000m, Status = StatusEnum.Approved },
            new PurchaseRequest { Id = Guid.NewGuid(), PRNumber = "PR-2026-OVCAA-002", Description = "PR for Digitization High-Speed Scanners", Purpose = "Archival of registrar records", PRType = PRType.NonCSE, RequestedDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-35)), TotalAmount = 1800000m, Status = StatusEnum.Approved },
            new PurchaseRequest { Id = Guid.NewGuid(), PRNumber = "PR-2026-OVCR-001", Description = "PR for STEM Analytical Spectrometer", Purpose = "Chemistry R&D facility setup", PRType = PRType.NonCSE, RequestedDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30)), TotalAmount = 4500000m, Status = StatusEnum.Approved },
            new PurchaseRequest { Id = Guid.NewGuid(), PRNumber = "PR-2026-ICTD-001", Description = "PR for Campus Wi-Fi 6 Access Points", Purpose = "Quadrangle high-speed internet rollout", PRType = PRType.NonCSE, RequestedDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-28)), TotalAmount = 3200000m, Status = StatusEnum.Approved },
            new PurchaseRequest { Id = Guid.NewGuid(), PRNumber = "PR-2026-ICTD-002", Description = "PR for Enterprise ERP License Subscriptions", Purpose = "Campus ERP annual maintenance", PRType = PRType.NonCSE, RequestedDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-25)), TotalAmount = 1500000m, Status = StatusEnum.Approved },
            new PurchaseRequest { Id = Guid.NewGuid(), PRNumber = "PR-2026-HRMO-001", Description = "PR for Common Office Paper & Stationery", Purpose = "General office administrative supplies", PRType = PRType.NonCSE, RequestedDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-20)), TotalAmount = 350000m, Status = StatusEnum.Approved },
            new PurchaseRequest { Id = Guid.NewGuid(), PRNumber = "PR-2026-CEA-001", Description = "PR for Motorpool Fleet Heavy Duty Tires", Purpose = "Maintenance of shuttle buses", PRType = PRType.NonCSE, RequestedDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-18)), TotalAmount = 450000m, Status = StatusEnum.Approved },
            new PurchaseRequest { Id = Guid.NewGuid(), PRNumber = "PR-2026-CEA-002", Description = "PR for Janitorial Sanitizing Chemicals", Purpose = "Sanitation of academic buildings", PRType = PRType.NonCSE, RequestedDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-15)), TotalAmount = 950000m, Status = StatusEnum.Approved },
            new PurchaseRequest { Id = Guid.NewGuid(), PRNumber = "PR-2026-OVCR-002", Description = "PR for Engineering CAD Simulation Workstations", Purpose = "CAD rendering laboratory", PRType = PRType.NonCSE, RequestedDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-10)), TotalAmount = 1400000m, Status = StatusEnum.Approved },
            new PurchaseRequest { Id = Guid.NewGuid(), PRNumber = "PR-2026-CEA-003", Description = "PR for Smart Classroom Touch Interactive Displays", Purpose = "Interactive display installation", PRType = PRType.NonCSE, RequestedDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-5)), TotalAmount = 2100000m, Status = StatusEnum.Approved }
        };

        for (var i = 0; i < prSeeds.Count; i++)
        {
            var pr = prSeeds[i];
            var ppmp = ppmps.ElementAtOrDefault(i);
            pr.OfficeId = ppmp?.OfficeId ?? defaultOffice?.Id ?? Guid.Empty;
            pr.FundSourceId = ppmp?.FundSourceId ?? defaultFs?.Id;
            pr.PPMPId = ppmp?.Id;

            var ppmpItem = ppmp?.PPMPExpenditureItems.SelectMany(e => e.PPMPItems).FirstOrDefault();
            if (ppmpItem != null)
            {
                var prItem = new PRItem
                {
                    Id = Guid.NewGuid(),
                    PurchaseRequestId = pr.Id,
                    PPMPItemId = ppmpItem.Id,
                    Name = pr.Description ?? ppmpItem.Name,
                    Description = pr.Purpose,
                    UnitCost = pr.TotalAmount,
                    RequestedQuantity = 1,
                    Amount = pr.TotalAmount,
                    IsNonCSE = true,
                    RequestedMonth = AllocationMonthEnum.January
                };
                pr.PRItems.Add(prItem);
            }

            context.PurchaseRequests.Add(pr);
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedConsolidatedPRsAsync(ApplicationDbContext context)
    {
        if (context.ConsolidatedPRs == null) return;

        var prs = await context.PurchaseRequests!.Include(p => p.PRItems).ToListAsync();
        var procModes = await context.ProcurementModes!.ToListAsync();
        var defaultMode = procModes.FirstOrDefault();

        var cprSeeds = new List<ConsolidatedPR>
        {
            new ConsolidatedPR { Id = Guid.NewGuid(), CPRNumber = "CPR-2026-001", Description = "Consolidation of University Workstations and IT Hardware Package", Purpose = "Standardize office workstations across academic units", ConsolidationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-30)), TotalAmount = 2500000m, Status = StatusEnum.Approved },
            new ConsolidatedPR { Id = Guid.NewGuid(), CPRNumber = "CPR-2026-002", Description = "Records Digitization and High-Speed Scanner Package", Purpose = "Modernize registrar and HR records archival", ConsolidationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-25)), TotalAmount = 1800000m, Status = StatusEnum.Approved },
            new ConsolidatedPR { Id = Guid.NewGuid(), CPRNumber = "CPR-2026-003", Description = "STEM Analytical Laboratory Apparatus and Instruments", Purpose = "Equip chemistry and material science laboratories", ConsolidationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-20)), TotalAmount = 4500000m, Status = StatusEnum.Approved },
            new ConsolidatedPR { Id = Guid.NewGuid(), CPRNumber = "CPR-2026-004", Description = "Campus Wi-Fi 6 Access Points & Network Switches Package", Purpose = "Full academic quadrangle broadband coverage", ConsolidationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-18)), TotalAmount = 3200000m, Status = StatusEnum.Approved },
            new ConsolidatedPR { Id = Guid.NewGuid(), CPRNumber = "CPR-2026-005", Description = "University Vehicle Fleet Maintenance & Spare Parts", Purpose = "Institutional motorpool operational readiness", ConsolidationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-15)), TotalAmount = 650000m, Status = StatusEnum.Approved },
            new ConsolidatedPR { Id = Guid.NewGuid(), CPRNumber = "CPR-2026-006", Description = "Janitorial, Sanitation, and Hygiene Consumables (Q1-Q2)", Purpose = "Maintain clean and sanitized campus facilities", ConsolidationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-12)), TotalAmount = 950000m, Status = StatusEnum.Approved },
            new ConsolidatedPR { Id = Guid.NewGuid(), CPRNumber = "CPR-2026-007", Description = "Engineering CAD Software Multi-Seat Network Licenses", Purpose = "Architecture and engineering capstone laboratory", ConsolidationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-10)), TotalAmount = 1400000m, Status = StatusEnum.Approved },
            new ConsolidatedPR { Id = Guid.NewGuid(), CPRNumber = "CPR-2026-008", Description = "Smart Classroom Interactive Displays & Projectors", Purpose = "Equip multimedia smart classrooms", ConsolidationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-8)), TotalAmount = 2100000m, Status = StatusEnum.Approved },
            new ConsolidatedPR { Id = Guid.NewGuid(), CPRNumber = "CPR-2026-009", Description = "Draft Consolidated PR for Security Guard Uniforms & Gear", Purpose = "Safety and security office provisioning", ConsolidationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-5)), TotalAmount = 480000m, Status = StatusEnum.Draft },
            new ConsolidatedPR { Id = Guid.NewGuid(), CPRNumber = "CPR-2026-010", Description = "Returned CPR for Library Book Acquistions FY 2026", Purpose = "Annual library print book and journal collection", ConsolidationDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-2)), TotalAmount = 1200000m, Status = StatusEnum.Returned, Remarks = "Revise title list to include updated 2026 copyright editions." }
        };

        for (var i = 0; i < cprSeeds.Count; i++)
        {
            var cpr = cprSeeds[i];
            var pr = prs.ElementAtOrDefault(i);
            var prItem = pr?.PRItems.FirstOrDefault();

            if (pr != null && prItem != null)
            {
                var cprItem = new ConsolidatedPRItem
                {
                    Id = Guid.NewGuid(),
                    ConsolidatedPRId = cpr.Id,
                    PurchaseRequestId = pr.Id,
                    PRItemId = prItem.Id,
                    ProcurementModeId = defaultMode?.Id,
                    AllowPartial = true
                };
                cpr.ConsolidatedPRItems.Add(cprItem);
            }

            context.ConsolidatedPRs.Add(cpr);
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedProcurementProjectsAsync(ApplicationDbContext context)
    {
        if (context.ProcurementProjects == null) return;

        var cprs = await context.ConsolidatedPRs!.ToListAsync();
        var defaultCpr = cprs.FirstOrDefault();
        var appItems = await context.APPItems!.ToListAsync();
        var procModes = await context.ProcurementModes!.ToListAsync();
        var defaultMode = procModes.FirstOrDefault();

        var projectSeeds = new List<ProcurementProject>
        {
            // Path B: Consolidated PR driven projects
            new ProcurementProject { Id = Guid.NewGuid(), SourceType = ProcurementProjectSourceType.ConsolidatedPR, Title = "Supply and Delivery of Onboarding Workstations & IT Equipment", ConsolidatedPRId = defaultCpr?.Id, ABC = 2500000m, Status = "Active", ContractNo = "USTP-PB-2026-001", ScopeOfWork = "Deliver and configure 50 desktop computer sets", DeliveryPeriodDays = 45, ProcurementModeId = defaultMode?.Id },
            new ProcurementProject { Id = Guid.NewGuid(), SourceType = ProcurementProjectSourceType.ConsolidatedPR, Title = "Procurement of Enterprise Records Digitization Solution", ConsolidatedPRId = cprs.Skip(1).FirstOrDefault()?.Id ?? defaultCpr?.Id, ABC = 1800000m, Status = "Active", ContractNo = "USTP-PB-2026-002", ScopeOfWork = "Deployment of document imaging hardware & OCR suite", DeliveryPeriodDays = 30, ProcurementModeId = defaultMode?.Id },
            new ProcurementProject { Id = Guid.NewGuid(), SourceType = ProcurementProjectSourceType.ConsolidatedPR, Title = "Acquisition of STEM Analytical Laboratory Apparatus", ConsolidatedPRId = cprs.Skip(2).FirstOrDefault()?.Id ?? defaultCpr?.Id, ABC = 4500000m, Status = "Active", ContractNo = "USTP-PB-2026-003", ScopeOfWork = "High-precision laboratory test instruments", DeliveryPeriodDays = 60, ProcurementModeId = defaultMode?.Id },
            new ProcurementProject { Id = Guid.NewGuid(), SourceType = ProcurementProjectSourceType.ConsolidatedPR, Title = "Supply and Installation of Campus Wi-Fi 6 Networking Package", ConsolidatedPRId = cprs.Skip(3).FirstOrDefault()?.Id ?? defaultCpr?.Id, ABC = 3200000m, Status = "Active", ContractNo = "USTP-PB-2026-004", ScopeOfWork = "Enterprise wireless access points & core routing", DeliveryPeriodDays = 60, ProcurementModeId = defaultMode?.Id },
            new ProcurementProject { Id = Guid.NewGuid(), SourceType = ProcurementProjectSourceType.ConsolidatedPR, Title = "Direct Contracting for Proprietary Campus ERP Software Licenses", ConsolidatedPRId = cprs.Skip(4).FirstOrDefault()?.Id ?? defaultCpr?.Id, ABC = 1500000m, Status = "Active", ContractNo = "USTP-DC-2026-001", ScopeOfWork = "Annual software license & technical maintenance", DeliveryPeriodDays = 15, ProcurementModeId = defaultMode?.Id },

            // Path A: APP Item driven projects
            new ProcurementProject { Id = Guid.NewGuid(), SourceType = ProcurementProjectSourceType.APPItem, APPItemId = appItems.ElementAtOrDefault(0)?.Id, Title = "Shopping for Office Paper & Common Printing Supplies (Q1-Q2)", ABC = 350000m, Status = "Active", ContractNo = "USTP-SHOP-2026-001", ScopeOfWork = "A4 paper and standard toner cartridges", DeliveryPeriodDays = 15, ProcurementModeId = defaultMode?.Id },
            new ProcurementProject { Id = Guid.NewGuid(), SourceType = ProcurementProjectSourceType.APPItem, APPItemId = appItems.ElementAtOrDefault(1)?.Id, Title = "Small Value Procurement of Motorpool Vehicle Tires & Battery Sets", ABC = 450000m, Status = "Active", ContractNo = "USTP-SVP-2026-001", ScopeOfWork = "Tubeless tires and maintenance-free batteries", DeliveryPeriodDays = 20, ProcurementModeId = defaultMode?.Id },
            new ProcurementProject { Id = Guid.NewGuid(), SourceType = ProcurementProjectSourceType.APPItem, APPItemId = appItems.ElementAtOrDefault(2)?.Id, Title = "Procurement of Janitorial Supplies for Health & Sanitation", ABC = 950000m, Status = "Active", ContractNo = "USTP-SVP-2026-002", ScopeOfWork = "Disinfectants, trash liners, and cleaning equipment", DeliveryPeriodDays = 30, ProcurementModeId = defaultMode?.Id },
            new ProcurementProject { Id = Guid.NewGuid(), SourceType = ProcurementProjectSourceType.APPItem, APPItemId = appItems.ElementAtOrDefault(3)?.Id, Title = "Procurement of CAD Simulation Engineering Workstations", ABC = 1400000m, Status = "Active", ContractNo = "USTP-PB-2026-005", ScopeOfWork = "Precision CAD graphics workstations", DeliveryPeriodDays = 45, ProcurementModeId = defaultMode?.Id },
            new ProcurementProject { Id = Guid.NewGuid(), SourceType = ProcurementProjectSourceType.APPItem, APPItemId = appItems.ElementAtOrDefault(4)?.Id, Title = "Smart Interactive Classroom Touch Displays Procurement", ABC = 2100000m, Status = "Active", ContractNo = "USTP-PB-2026-006", ScopeOfWork = "75-inch 4K interactive touch displays", DeliveryPeriodDays = 30, ProcurementModeId = defaultMode?.Id }
        };

        foreach (var proj in projectSeeds)
        {
            if (proj.ConsolidatedPRId != null && await context.ProcurementProjects.AnyAsync(p => p.ConsolidatedPRId == proj.ConsolidatedPRId))
                continue;

            if (proj.APPItemId != null && await context.ProcurementProjects.AnyAsync(p => p.APPItemId == proj.APPItemId))
                continue;

            context.ProcurementProjects.Add(proj);
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedBACResolutionsAsync(ApplicationDbContext context)
    {
        if (context.BACResolutions == null) return;

        var projects = await context.ProcurementProjects!.ToListAsync();
        var defaultProject = projects.FirstOrDefault();

        var resolutionSeeds = new List<BACResolution>
        {
            new BACResolution { Id = Guid.NewGuid(), ProcurementProjectId = defaultProject?.Id ?? Guid.Empty, ResolutionNumber = "BAC-RES-2026-001", ResolutionType = "procurement-mode-recommendation", DateResolved = DateTime.UtcNow.AddDays(-20), Status = "draft", WhereasClause = "WHEREAS, Section 12 of R.A. 9184 provides that the BAC shall recommend to the HoPE the use of Alternative Methods of Procurement;" },
            new BACResolution { Id = Guid.NewGuid(), ProcurementProjectId = projects.Skip(1).FirstOrDefault()?.Id ?? defaultProject?.Id ?? Guid.Empty, ResolutionNumber = "BAC-RES-2026-002", ResolutionType = "procurement-mode-recommendation", DateResolved = DateTime.UtcNow.AddDays(-18), Status = "for-approval", WhereasClause = "WHEREAS, the BAC has reviewed the technical specifications and recommended Public Bidding as the competitive mode of procurement;" },
            new BACResolution { Id = Guid.NewGuid(), ProcurementProjectId = projects.Skip(2).FirstOrDefault()?.Id ?? defaultProject?.Id ?? Guid.Empty, ResolutionNumber = "BAC-RES-2026-003", ResolutionType = "procurement-mode-recommendation", DateResolved = DateTime.UtcNow.AddDays(-15), Status = "approved", WhereasClause = "WHEREAS, following market scoping, the BAC determined that Direct Contracting is justified under Section 50(c) of R.A. 9184;" },
            new BACResolution { Id = Guid.NewGuid(), ProcurementProjectId = projects.Skip(3).FirstOrDefault()?.Id ?? defaultProject?.Id ?? Guid.Empty, ResolutionNumber = "BAC-RES-2026-004", ResolutionType = "award-recommendation", DateResolved = DateTime.UtcNow.AddDays(-12), Status = "approved", WhereasClause = "WHEREAS, following post-qualification, the lowest calculated responsive bidder has satisfied all legal, technical, and financial criteria;" },
            new BACResolution { Id = Guid.NewGuid(), ProcurementProjectId = projects.Skip(4).FirstOrDefault()?.Id ?? defaultProject?.Id ?? Guid.Empty, ResolutionNumber = "BAC-RES-2026-005", ResolutionType = "award-recommendation", DateResolved = DateTime.UtcNow.AddDays(-10), Status = "for-approval", WhereasClause = "WHEREAS, the single calculated responsive bidder was verified compliant with all technical specifications;" },
            new BACResolution { Id = Guid.NewGuid(), ProcurementProjectId = projects.Skip(5).FirstOrDefault()?.Id ?? defaultProject?.Id ?? Guid.Empty, ResolutionNumber = "BAC-RES-2026-006", ResolutionType = "declare-failure-of-bidding", DateResolved = DateTime.UtcNow.AddDays(-8), Status = "approved", WhereasClause = "WHEREAS, no bids were received during the scheduled bid opening, necessitating a declaration of failure of bidding under Section 35.1;" },
            new BACResolution { Id = Guid.NewGuid(), ProcurementProjectId = projects.Skip(6).FirstOrDefault()?.Id ?? defaultProject?.Id ?? Guid.Empty, ResolutionNumber = "BAC-RES-2026-007", ResolutionType = "procurement-mode-recommendation", DateResolved = DateTime.UtcNow.AddDays(-7), Status = "returned", WhereasClause = "WHEREAS, revisions were mandated by the Legal Office regarding warranty security clauses prior to endorsement;" },
            new BACResolution { Id = Guid.NewGuid(), ProcurementProjectId = projects.Skip(7).FirstOrDefault()?.Id ?? defaultProject?.Id ?? Guid.Empty, ResolutionNumber = "BAC-RES-2026-008", ResolutionType = "award-recommendation", DateResolved = DateTime.UtcNow.AddDays(-5), Status = "draft", WhereasClause = "WHEREAS, the TWG completed post-qualification evaluation for the interactive touch displays package;" },
            new BACResolution { Id = Guid.NewGuid(), ProcurementProjectId = projects.Skip(8).FirstOrDefault()?.Id ?? defaultProject?.Id ?? Guid.Empty, ResolutionNumber = "BAC-RES-2026-009", ResolutionType = "procurement-mode-recommendation", DateResolved = DateTime.UtcNow.AddDays(-4), Status = "approved", WhereasClause = "WHEREAS, Small Value Procurement was authorized for vehicle maintenance consumables under Section 53.9;" },
            new BACResolution { Id = Guid.NewGuid(), ProcurementProjectId = projects.Skip(9).FirstOrDefault()?.Id ?? defaultProject?.Id ?? Guid.Empty, ResolutionNumber = "BAC-RES-2026-010", ResolutionType = "award-recommendation", DateResolved = DateTime.UtcNow.AddDays(-3), Status = "approved", WhereasClause = "WHEREAS, the BAC hereby recommends the award of contract for CAD workstations to the winning supplier;" },
            new BACResolution { Id = Guid.NewGuid(), ProcurementProjectId = defaultProject?.Id ?? Guid.Empty, ResolutionNumber = "BAC-RES-2026-011", ResolutionType = "procurement-mode-recommendation", DateResolved = DateTime.UtcNow.AddDays(-2), Status = "draft", WhereasClause = "WHEREAS, supplemental procurement requirements for laboratory testing supplies have been reviewed;" },
            new BACResolution { Id = Guid.NewGuid(), ProcurementProjectId = defaultProject?.Id ?? Guid.Empty, ResolutionNumber = "BAC-RES-2026-012", ResolutionType = "award-recommendation", DateResolved = DateTime.UtcNow.AddDays(-1), Status = "approved", WhereasClause = "WHEREAS, the contract is recommended for award following comprehensive price validation;" }
        };

        foreach (var res in resolutionSeeds)
        {
            if (res.ProcurementProjectId == Guid.Empty) continue;
            context.BACResolutions.Add(res);
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedBiddingActivitySchedulesAsync(ApplicationDbContext context)
    {
        if (context.BiddingActivitySchedules == null) return;

        var projects = await context.ProcurementProjects!.ToListAsync();
        var defaultProject = projects.FirstOrDefault();
        var activityType = await context.ProcurementActivityTypes!.FirstOrDefaultAsync();

        if (defaultProject == null || activityType == null) return;

        var scheduleSeeds = new List<BiddingActivitySchedule>();
        var projectList = projects.Take(5).ToList();

        int counter = 1;
        foreach (var proj in projectList)
        {
            scheduleSeeds.Add(new BiddingActivitySchedule
            {
                Id = Guid.NewGuid(),
                ProcurementProjectId = proj.Id,
                ProcurementActivityTypeId = activityType.Id,
                StartDate = DateTime.UtcNow.AddDays(counter * 2),
                EndDate = DateTime.UtcNow.AddDays(counter * 2 + 3),
                Venue = "USTP BAC Conference Room, 2nd Floor Administration Building",
                Status = counter % 2 == 0 ? "Completed" : "Scheduled",
                Remarks = $"Scheduled statutory bidding milestone #{counter}"
            });
            counter++;

            scheduleSeeds.Add(new BiddingActivitySchedule
            {
                Id = Guid.NewGuid(),
                ProcurementProjectId = proj.Id,
                ProcurementActivityTypeId = activityType.Id,
                StartDate = DateTime.UtcNow.AddDays(counter * 3),
                EndDate = DateTime.UtcNow.AddDays(counter * 3 + 1),
                Venue = "USTP Bidding Hall & Virtual Zoom Portal",
                Status = "Scheduled",
                Remarks = $"Simultaneous hybrid bid evaluation milestone #{counter}"
            });
            counter++;
        }

        foreach (var sch in scheduleSeeds)
        {
            context.BiddingActivitySchedules.Add(sch);
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedRFQsAsync(ApplicationDbContext context)
    {
        if (context.RFQs == null) return;

        var cprs = await context.ConsolidatedPRs!.Include(c => c.ConsolidatedPRItems).ToListAsync();
        var procModes = await context.ProcurementModes!.ToListAsync();
        var defaultMode = procModes.FirstOrDefault(m => m.Name == "Small Value Procurement") ?? procModes.FirstOrDefault();

        var rfqSeeds = new List<RFQ>
        {
            new RFQ { Id = Guid.NewGuid(), RFQNumber = "RFQ-2026-001", TracingNumber = "TR-2026-001", Description = "RFQ for Common Office Stationeries and Papers", Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-15)), Deadline = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-5)), DeliveryPeriod = "7 Calendar Days", Purpose = "Administrative Office Stock", Status = StatusEnum.Approved, TotalAmount = 350000m },
            new RFQ { Id = Guid.NewGuid(), RFQNumber = "RFQ-2026-002", TracingNumber = "TR-2026-002", Description = "RFQ for Motorpool Fleet Heavy Duty Tires", Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-12)), Deadline = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-2)), DeliveryPeriod = "10 Calendar Days", Purpose = "Vehicle maintenance", Status = StatusEnum.Approved, TotalAmount = 450000m },
            new RFQ { Id = Guid.NewGuid(), RFQNumber = "RFQ-2026-003", TracingNumber = "TR-2026-003", Description = "RFQ for Janitorial Cleaning & Hygiene Package", Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-10)), Deadline = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2)), DeliveryPeriod = "15 Calendar Days", Purpose = "Sanitation maintenance", Status = StatusEnum.Approved, TotalAmount = 950000m },
            new RFQ { Id = Guid.NewGuid(), RFQNumber = "RFQ-2026-004", TracingNumber = "TR-2026-004", Description = "RFQ for Interactive Display Brackets & Cables", Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-8)), Deadline = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(5)), DeliveryPeriod = "15 Calendar Days", Purpose = "Smart classroom installation", Status = StatusEnum.Submitted, TotalAmount = 250000m },
            new RFQ { Id = Guid.NewGuid(), RFQNumber = "RFQ-2026-005", TracingNumber = "TR-2026-005", Description = "RFQ for Security Guard Uniform Accessories", Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-5)), Deadline = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(8)), DeliveryPeriod = "20 Calendar Days", Purpose = "Campus security office", Status = StatusEnum.Draft, TotalAmount = 480000m }
        };

        for (var i = 0; i < rfqSeeds.Count; i++)
        {
            var rfq = rfqSeeds[i];
            var cpr = cprs.ElementAtOrDefault(i);
            var cprItem = cpr?.ConsolidatedPRItems.FirstOrDefault();

            rfq.ConsolidatedPRId = cpr?.Id;
            rfq.ModeOfProcurementId = defaultMode?.Id;

            if (cprItem != null)
            {
                var rfqItem = new RFQItem
                {
                    Id = Guid.NewGuid(),
                    RFQId = rfq.Id,
                    CPRItemId = cprItem.Id,
                    ItemNameSnapshot = rfq.Description ?? "RFQ Item Package",
                    Quantity = 1,
                    UnitPriceSnapshot = rfq.TotalAmount
                };
                rfq.RFQItems.Add(rfqItem);
            }

            context.RFQs.Add(rfq);
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedSuppliersAsync(ApplicationDbContext context)
    {
        if (context.Suppliers == null) return;

        var defaultCategory = await context.SupplierCategories!.FirstOrDefaultAsync();
        if (defaultCategory == null)
        {
            defaultCategory = new SupplierCategory
            {
                Id = Guid.NewGuid(),
                Name = "General Goods & IT Infrastructure",
                Description = "Commercial enterprise technology and goods supplier"
            };
            context.SupplierCategories!.Add(defaultCategory);
            await context.SaveChangesAsync();
        }

        var supplierSeeds = new List<Supplier>
        {
            new Supplier { Id = Guid.NewGuid(), Name = "Nexus Tech Solutions Inc.", BusinessPermitNo = "BP-CDO-2026-00123", ContactPerson = "Maria Elena Corpuz", ContactNumber = "+63 917 123 4567", Email = "bids@nexustech.ph", Address = "J.R. Borja Extension, Cagayan de Oro City", TINNumber = "123-456-789-000", PhilGEPSNumber = "PHILGEPS-PLAT-98712", Status = nameof(SupplierStatusEnum.Approved), SupplierCategoryId = defaultCategory.Id },
            new Supplier { Id = Guid.NewGuid(), Name = "Alpha Science & Laboratory Supplies", BusinessPermitNo = "BP-CDO-2026-00456", ContactPerson = "Engr. Jonathan Tan", ContactNumber = "+63 918 234 5678", Email = "sales@alphascience.ph", Address = "Lapasan National Highway, Cagayan de Oro City", TINNumber = "234-567-890-000", PhilGEPSNumber = "PHILGEPS-PLAT-98713", Status = nameof(SupplierStatusEnum.Approved), SupplierCategoryId = defaultCategory.Id },
            new Supplier { Id = Guid.NewGuid(), Name = "Precision Network & Fiber Solutions", BusinessPermitNo = "BP-CDO-2026-00789", ContactPerson = "Carlos Mendoza", ContactNumber = "+63 919 345 6789", Email = "tenders@precisionnet.ph", Address = "Kauswagan Road, Cagayan de Oro City", TINNumber = "345-678-901-000", PhilGEPSNumber = "PHILGEPS-PLAT-98714", Status = nameof(SupplierStatusEnum.Approved), SupplierCategoryId = defaultCategory.Id },
            new Supplier { Id = Guid.NewGuid(), Name = "Vanguard Office Supplies & Furniture Co.", BusinessPermitNo = "BP-CDO-2026-00912", ContactPerson = "Lourdes Bautista", ContactNumber = "+63 920 456 7890", Email = "info@vanguardfurniture.ph", Address = "Velez Street, Cagayan de Oro City", TINNumber = "456-789-012-000", PhilGEPSNumber = "PHILGEPS-PLAT-98715", Status = nameof(SupplierStatusEnum.Approved), SupplierCategoryId = defaultCategory.Id },
            new Supplier { Id = Guid.NewGuid(), Name = "Starlight Educational Media & Tech", BusinessPermitNo = "BP-CDO-2026-01123", ContactPerson = "Rene Del Rosario", ContactNumber = "+63 921 567 8901", Email = "bids@starlightmedia.ph", Address = "Corrales Avenue, Cagayan de Oro City", TINNumber = "567-890-123-000", PhilGEPSNumber = "PHILGEPS-PLAT-98716", Status = nameof(SupplierStatusEnum.Approved), SupplierCategoryId = defaultCategory.Id },
            new Supplier { Id = Guid.NewGuid(), Name = "AeroDynamic Auto Parts & Fleet Services", BusinessPermitNo = "BP-CDO-2026-01345", ContactPerson = "Gilbert Santos", ContactNumber = "+63 922 678 9012", Email = "fleet@aerodynamic.ph", Address = "Bulua Highway, Cagayan de Oro City", TINNumber = "678-901-234-000", PhilGEPSNumber = "PHILGEPS-PLAT-98717", Status = nameof(SupplierStatusEnum.Approved), SupplierCategoryId = defaultCategory.Id },
            new Supplier { Id = Guid.NewGuid(), Name = "CleanPro Sanitation & Industrial Chemicals", BusinessPermitNo = "BP-CDO-2026-01567", ContactPerson = "Giselle Aquino", ContactNumber = "+63 923 789 0123", Email = "orders@cleanproph.com", Address = "Macabalan Pier Road, Cagayan de Oro City", TINNumber = "789-012-345-000", PhilGEPSNumber = "PHILGEPS-PLAT-98718", Status = nameof(SupplierStatusEnum.Approved), SupplierCategoryId = defaultCategory.Id },
            new Supplier { Id = Guid.NewGuid(), Name = "Zenith Engineering CAD Systems", BusinessPermitNo = "BP-CDO-2026-01789", ContactPerson = "Arch. Dennis Lim", ContactNumber = "+63 924 890 1234", Email = "licensing@zenithcad.ph", Address = "Carmen Commercial Center, Cagayan de Oro City", TINNumber = "890-123-456-000", PhilGEPSNumber = "PHILGEPS-PLAT-98719", Status = nameof(SupplierStatusEnum.Approved), SupplierCategoryId = defaultCategory.Id },
            new Supplier { Id = Guid.NewGuid(), Name = "OmniPrint Paper & Industrial Supplies", BusinessPermitNo = "BP-CDO-2026-01901", ContactPerson = "Teresa Villanueva", ContactNumber = "+63 925 901 2345", Email = "sales@omniprint.ph", Address = "Gusa Highway, Cagayan de Oro City", TINNumber = "901-234-567-000", PhilGEPSNumber = "PHILGEPS-PLAT-98720", Status = nameof(SupplierStatusEnum.Approved), SupplierCategoryId = defaultCategory.Id },
            new Supplier { Id = Guid.NewGuid(), Name = "Pending Verification Technologies", BusinessPermitNo = "BP-CDO-2026-02111", ContactPerson = "Francis De Leon", ContactNumber = "+63 926 012 3456", Email = "info@pendingtech.ph", Address = "Nazareth, Cagayan de Oro City", TINNumber = "012-345-678-000", Status = nameof(SupplierStatusEnum.Pending), SupplierCategoryId = defaultCategory.Id }
        };

        foreach (var sup in supplierSeeds)
        {
            var exists = false;
            if (!string.IsNullOrWhiteSpace(sup.BusinessPermitNo))
                exists = exists || await context.Suppliers.AnyAsync(s => s.BusinessPermitNo == sup.BusinessPermitNo);
            if (!string.IsNullOrWhiteSpace(sup.TINNumber))
                exists = exists || await context.Suppliers.AnyAsync(s => s.TINNumber == sup.TINNumber);

            if (exists) continue;

            context.Suppliers.Add(sup);
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedPurchaseOrdersAsync(ApplicationDbContext context)
    {
        if (context.PurchaseOrders == null) return;

        var suppliers = await context.Suppliers!.ToListAsync();
        var defaultSupplier = suppliers.FirstOrDefault();

        if (defaultSupplier == null) return;

        var poSeeds = new List<PurchaseOrder>
        {
            new PurchaseOrder { Id = Guid.NewGuid(), PONumber = "PO-2026-001", ProcurementMode = POProcurementModeEnum.PUBLIC_BIDDING, SourceDocumentType = SourceDocumentTypeEnum.BAC_RESOLUTION, SourceDocumentId = Guid.NewGuid(), SupplierId = defaultSupplier.Id, Description = "Purchase Order for 50 Onboarding Workstation Sets", Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-15)), PlaceOfDelivery = "USTP CDO Property & Supply Office", DateOfDelivery = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(30)), DeliveryTerm = "30 Calendar Days", PaymentTerm = "Government Cheque upon final acceptance", Status = StatusEnum.Approved, TotalAmount = 2500000m },
            new PurchaseOrder { Id = Guid.NewGuid(), PONumber = "PO-2026-002", ProcurementMode = POProcurementModeEnum.PUBLIC_BIDDING, SourceDocumentType = SourceDocumentTypeEnum.BAC_RESOLUTION, SourceDocumentId = Guid.NewGuid(), SupplierId = suppliers.Skip(1).FirstOrDefault()?.Id ?? defaultSupplier.Id, Description = "Purchase Order for Chemistry Spectrometer & Lab Apparatus", Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-12)), PlaceOfDelivery = "USTP CDO Science Building", DateOfDelivery = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(45)), DeliveryTerm = "45 Calendar Days", PaymentTerm = "Progress Billing", Status = StatusEnum.Approved, TotalAmount = 4500000m },
            new PurchaseOrder { Id = Guid.NewGuid(), PONumber = "PO-2026-003", ProcurementMode = POProcurementModeEnum.PUBLIC_BIDDING, SourceDocumentType = SourceDocumentTypeEnum.BAC_RESOLUTION, SourceDocumentId = Guid.NewGuid(), SupplierId = suppliers.Skip(2).FirstOrDefault()?.Id ?? defaultSupplier.Id, Description = "Purchase Order for Wi-Fi 6 Enterprise Access Points", Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-10)), PlaceOfDelivery = "ICTD Server Facility", DateOfDelivery = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(30)), DeliveryTerm = "30 Calendar Days", PaymentTerm = "Bank Transfer", Status = StatusEnum.Approved, TotalAmount = 3200000m },
            new PurchaseOrder { Id = Guid.NewGuid(), PONumber = "PO-2026-004", ProcurementMode = POProcurementModeEnum.DIRECT_ACQUISITION, SourceDocumentType = SourceDocumentTypeEnum.NOA, SourceDocumentId = Guid.NewGuid(), SupplierId = defaultSupplier.Id, Description = "Purchase Order for Proprietary ERP Software Licenses", Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-8)), PlaceOfDelivery = "USTP CDO", DateOfDelivery = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(15)), DeliveryTerm = "Electronic Delivery", PaymentTerm = "Full upon License Activation", Status = StatusEnum.Approved, TotalAmount = 1500000m },
            new PurchaseOrder { Id = Guid.NewGuid(), PONumber = "PO-2026-005", ProcurementMode = POProcurementModeEnum.SVP, SourceDocumentType = SourceDocumentTypeEnum.AOB, SourceDocumentId = Guid.NewGuid(), SupplierId = suppliers.Skip(3).FirstOrDefault()?.Id ?? defaultSupplier.Id, Description = "Purchase Order for Office Furniture & Executive Desks", Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-6)), PlaceOfDelivery = "USTP Admin Quadrangle", DateOfDelivery = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(20)), DeliveryTerm = "20 Calendar Days", PaymentTerm = "Government Cheque", Status = StatusEnum.Approved, TotalAmount = 750000m },
            new PurchaseOrder { Id = Guid.NewGuid(), PONumber = "PO-2026-006", ProcurementMode = POProcurementModeEnum.SVP, SourceDocumentType = SourceDocumentTypeEnum.AOB, SourceDocumentId = Guid.NewGuid(), SupplierId = suppliers.Skip(4).FirstOrDefault()?.Id ?? defaultSupplier.Id, Description = "Purchase Order for Smart Classroom Multimedia Displays", Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-5)), PlaceOfDelivery = "USTP Academic Buildings", DateOfDelivery = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(25)), DeliveryTerm = "25 Calendar Days", PaymentTerm = "Government Cheque", Status = StatusEnum.Approved, TotalAmount = 2100000m },
            new PurchaseOrder { Id = Guid.NewGuid(), PONumber = "PO-2026-007", ProcurementMode = POProcurementModeEnum.SVP, SourceDocumentType = SourceDocumentTypeEnum.AOB, SourceDocumentId = Guid.NewGuid(), SupplierId = suppliers.Skip(5).FirstOrDefault()?.Id ?? defaultSupplier.Id, Description = "Purchase Order for Motorpool Heavy Duty Tires", Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-4)), PlaceOfDelivery = "USTP Motorpool Bay", DateOfDelivery = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(10)), DeliveryTerm = "10 Calendar Days", PaymentTerm = "Government Cheque", Status = StatusEnum.Approved, TotalAmount = 450000m },
            new PurchaseOrder { Id = Guid.NewGuid(), PONumber = "PO-2026-008", ProcurementMode = POProcurementModeEnum.SVP, SourceDocumentType = SourceDocumentTypeEnum.AOB, SourceDocumentId = Guid.NewGuid(), SupplierId = suppliers.Skip(6).FirstOrDefault()?.Id ?? defaultSupplier.Id, Description = "Purchase Order for Janitorial Disinfectant Chemicals", Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-3)), PlaceOfDelivery = "USTP General Warehouse", DateOfDelivery = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(15)), DeliveryTerm = "15 Calendar Days", PaymentTerm = "Government Cheque", Status = StatusEnum.Approved, TotalAmount = 950000m },
            new PurchaseOrder { Id = Guid.NewGuid(), PONumber = "PO-2026-009", ProcurementMode = POProcurementModeEnum.PUBLIC_BIDDING, SourceDocumentType = SourceDocumentTypeEnum.BAC_RESOLUTION, SourceDocumentId = Guid.NewGuid(), SupplierId = suppliers.Skip(7).FirstOrDefault()?.Id ?? defaultSupplier.Id, Description = "Purchase Order for CAD Engineering Workstations", Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-2)), PlaceOfDelivery = "CEA Computer Lab", DateOfDelivery = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(30)), DeliveryTerm = "30 Calendar Days", PaymentTerm = "Government Cheque", Status = StatusEnum.Draft, TotalAmount = 1400000m },
            new PurchaseOrder { Id = Guid.NewGuid(), PONumber = "PO-2026-010", ProcurementMode = POProcurementModeEnum.SVP, SourceDocumentType = SourceDocumentTypeEnum.AOB, SourceDocumentId = Guid.NewGuid(), SupplierId = suppliers.Skip(8).FirstOrDefault()?.Id ?? defaultSupplier.Id, Description = "Purchase Order for Multipurpose Copy Paper (Q1)", Date = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1)), PlaceOfDelivery = "Property & Supply Division", DateOfDelivery = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)), DeliveryTerm = "7 Calendar Days", PaymentTerm = "Government Cheque", Status = StatusEnum.Draft, TotalAmount = 350000m }
        };

        foreach (var po in poSeeds)
        {
            if (!string.IsNullOrWhiteSpace(po.PONumber) && await context.PurchaseOrders.AnyAsync(p => p.PONumber == po.PONumber))
                continue;

            var item = new PurchaseOrderItem
            {
                Id = Guid.NewGuid(),
                PurchaseOrderId = po.Id,
                SourceItemId = Guid.NewGuid(),
                Description = po.Description,
                Quantity = 1,
                Unit = "lot",
                UnitPrice = po.TotalAmount,
                Amount = po.TotalAmount
            };
            po.PurchaseOrderItems.Add(item);
            context.PurchaseOrders.Add(po);
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedMasterCatalogAndItemsAsync(ApplicationDbContext context)
    {
        var uoms = await context.UOMs!.ToListAsync();
        var objects = await context.Objects!.ToListAsync();
        var fys = await context.FiscalYears!.ToListAsync();
        var defaultUom = uoms.FirstOrDefault();
        var defaultObject = objects.FirstOrDefault();
        var defaultFy = fys.FirstOrDefault(f => f.Year == 2026) ?? fys.FirstOrDefault();
        var categories = await context.ItemCategories!.ToListAsync();
        var defaultCategory = categories.FirstOrDefault();

        if (context.ProcurementItems != null && !await context.ProcurementItems.AnyAsync() && defaultUom != null && defaultObject != null && defaultFy != null)
        {
            var pItems = new List<ProcurementItem>
            {
                new ProcurementItem { Id = Guid.NewGuid(), Name = "Multipurpose Paper A4 80gsm", Specifications = "High white, 500 sheets/ream", Type = "Expendable", IsCSE = true, ProductCode = "CSE-PAP-001", ObjectCodeId = defaultObject.Id, UOMId = defaultUom.Id, ItemCategoryId = defaultCategory?.Id },
                new ProcurementItem { Id = Guid.NewGuid(), Name = "Hand Sanitizer Gel 1000ml", Specifications = "70% Isopropyl Alcohol with pump", Type = "Expendable", IsCSE = true, ProductCode = "CSE-SAN-001", ObjectCodeId = defaultObject.Id, UOMId = defaultUom.Id, ItemCategoryId = defaultCategory?.Id },
                new ProcurementItem { Id = Guid.NewGuid(), Name = "High-Performance Workstation Laptop", Specifications = "Core i9, 32GB RAM, 1TB NVMe, RTX 4070", Type = "NonExpendable", IsCSE = false, ProductCode = "NONCSE-LAP-001", ObjectCodeId = defaultObject.Id, UOMId = defaultUom.Id, ItemCategoryId = defaultCategory?.Id },
                new ProcurementItem { Id = Guid.NewGuid(), Name = "Binocular Laboratory Microscope", Specifications = "LED illumination, 40x-1000x magnification", Type = "NonExpendable", IsCSE = false, ProductCode = "NONCSE-MIC-001", ObjectCodeId = defaultObject.Id, UOMId = defaultUom.Id, ItemCategoryId = defaultCategory?.Id },
                new ProcurementItem { Id = Guid.NewGuid(), Name = "Enterprise 24-Port Gigabit Switch", Specifications = "Managed PoE+ 370W, 4x SFP+ uplinks", Type = "NonExpendable", IsCSE = false, ProductCode = "NONCSE-NET-001", ObjectCodeId = defaultObject.Id, UOMId = defaultUom.Id, ItemCategoryId = defaultCategory?.Id }
            };

            foreach (var item in pItems)
            {
                context.ProcurementItems.Add(item);
                context.ItemPrices.Add(new ItemPrice
                {
                    Id = Guid.NewGuid(),
                    ProcurementItemId = item.Id,
                    UnitPrice = item.IsCSE ? 250m : 75000m,
                    FiscalYearId = defaultFy.Id
                });

                if (item.IsCSE)
                {
                    context.CSEItems.Add(new CSEItem
                    {
                        Id = Guid.NewGuid(),
                        ProductCode = item.ProductCode ?? "CSE-001",
                        Name = item.Name,
                        Description = item.Specifications,
                        Unit = defaultUom.Name,
                        Price = 250m,
                        Type = CSEItemType.Expendable
                    });
                }
            }
            await context.SaveChangesAsync();
        }

        if (context.NonCSEItems != null && !await context.NonCSEItems.AnyAsync() && defaultUom != null)
        {
            var nonCseSeeds = new List<NonCSEItem>
            {
                new NonCSEItem { Id = Guid.NewGuid(), Name = "High-Performance Workstation Laptop", Description = "Core i9, 32GB RAM, 1TB NVMe, RTX 4070", CurrentPrice = 85000m, BaseCost = 80000m, SellingPrice = 85000m, ProductCode = "NONCSE-LAP-001", Type = "NonExpendable", Status = "Approved", IsActive = true, UOMId = defaultUom.Id, ItemCategoryId = defaultCategory?.Id },
                new NonCSEItem { Id = Guid.NewGuid(), Name = "Binocular Laboratory Microscope", Description = "LED illumination, 40x-1000x magnification", CurrentPrice = 120000m, BaseCost = 110000m, SellingPrice = 120000m, ProductCode = "NONCSE-MIC-001", Type = "NonExpendable", Status = "Approved", IsActive = true, UOMId = defaultUom.Id, ItemCategoryId = defaultCategory?.Id },
                new NonCSEItem { Id = Guid.NewGuid(), Name = "Enterprise 24-Port Gigabit Switch", Description = "Managed PoE+ 370W, 4x SFP+ uplinks", CurrentPrice = 45000m, BaseCost = 40000m, SellingPrice = 45000m, ProductCode = "NONCSE-NET-001", Type = "NonExpendable", Status = "Approved", IsActive = true, UOMId = defaultUom.Id, ItemCategoryId = defaultCategory?.Id }
            };
            context.NonCSEItems.AddRange(nonCseSeeds);
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedBACResolutionWhereasClausesAsync(ApplicationDbContext context)
    {
        if (context.BACResolutionWhereasClauses != null && !await context.BACResolutionWhereasClauses.AnyAsync())
        {
            var clauses = new List<BACResolutionWhereasClause>
            {
                new BACResolutionWhereasClause { Id = Guid.NewGuid(), Name = "RA 9184 General Mandate", Body = "WHEREAS, Section 12 of Republic Act No. 9184 provides that the Bids and Awards Committee (BAC) shall recommend the award of contract and mode of procurement to the Head of the Procuring Entity (HoPE);" },
                new BACResolutionWhereasClause { Id = Guid.NewGuid(), Name = "APP Alignment Verification", Body = "WHEREAS, the requested procurement project is duly included and approved under the Annual Procurement Plan (APP) of the University for the current fiscal year;" },
                new BACResolutionWhereasClause { Id = Guid.NewGuid(), Name = "Alternative Method Justification", Body = "WHEREAS, following market scoping and technical evaluation by the Technical Working Group (TWG), Alternative Method of Procurement under Rule XVI of the 2016 Revised IRR of R.A. 9184 is justified;" },
                new BACResolutionWhereasClause { Id = Guid.NewGuid(), Name = "Post-Qualification Compliance", Body = "WHEREAS, the Technical Working Group (TWG) conducted post-qualification and confirmed that the lowest calculated bidder has met all legal, technical, and financial requirements;" },
                new BACResolutionWhereasClause { Id = Guid.NewGuid(), Name = "Availability of Funds Certification", Body = "WHEREAS, the University Budget Management Office has issued a Certificate of Availability of Funds (CAF) covering the Approved Budget for the Contract (ABC);" }
            };
            context.BACResolutionWhereasClauses.AddRange(clauses);
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedAOBsAsync(ApplicationDbContext context)
    {
        if (context.AOBs != null && !await context.AOBs.AnyAsync())
        {
            var projects = await context.ProcurementProjects!.ToListAsync();
            var proj = projects.FirstOrDefault();
            var aob = new AOB
            {
                Id = Guid.NewGuid(),
                AOBNumber = "AOB-2026-001",
                Description = "Abstract of Bids for Onboarding Workstations & IT Equipment",
                AwardCriterion = "LCRB",
                AOBDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-10)),
                OpeningDate = DateTime.UtcNow.AddDays(-12),
                Status = "APPROVED"
            };

            if (proj != null)
            {
                aob.AOBProcurementProjectMappings.Add(new AOBProcurementProjectMapping
                {
                    Id = Guid.NewGuid(),
                    AOBId = aob.Id,
                    ProcurementProjectId = proj.Id
                });
            }

            context.AOBs.Add(aob);
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedAPRsAsync(ApplicationDbContext context)
    {
        if (context.APRs != null && !await context.APRs.AnyAsync())
        {
            var apps = await context.APPs!.ToListAsync();
            var offices = await context.Offices!.ToListAsync();
            var fys = await context.FiscalYears!.ToListAsync();
            var defaultApp = apps.FirstOrDefault();
            var defaultOffice = offices.FirstOrDefault();
            var defaultFy = fys.FirstOrDefault(f => f.Year == 2026) ?? fys.FirstOrDefault();

            if (defaultApp != null && defaultOffice != null && defaultFy != null)
            {
                var apr = new APR
                {
                    Id = Guid.NewGuid(),
                    APRNumber = "APR-2026-001",
                    APPId = defaultApp.Id,
                    OfficeId = defaultOffice.Id,
                    FiscalYearId = defaultFy.Id,
                    TotalAmount = 500000m,
                    AgencyControlNumber = "ACN-2026-001",
                    AgencyAccountCode = "10101010",
                    RequestDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-15)),
                    Description = "Agency Procurement Request for Common-Use Supplies Q1",
                    ModeOfDelivery = APRModeOfDelivery.FastLane,
                    InsufficientFundsAction = APRInsufficientFundsAction.ReduceQuantity,
                    RequiresObR = true,
                    RequiresCBA = true,
                    RequiresCompleteSpecifications = true,
                    Status = StatusEnum.Approved,
                    SubmittedDate = DateTime.UtcNow.AddDays(-14),
                    ApprovedDate = DateTime.UtcNow.AddDays(-10)
                };

                context.APRs.Add(apr);
                await context.SaveChangesAsync();
            }
        }
    }

    private static async Task SeedDirectContractingsAsync(ApplicationDbContext context)
    {
        if (context.DirectContractings != null && !await context.DirectContractings.AnyAsync())
        {
            var projects = await context.ProcurementProjects!.ToListAsync();
            var suppliers = await context.Suppliers!.ToListAsync();
            var defaultProject = projects.FirstOrDefault();
            var defaultSupplier = suppliers.FirstOrDefault();

            if (defaultProject != null && defaultSupplier != null)
            {
                var dc = new DirectContracting
                {
                    Id = Guid.NewGuid(),
                    DCNumber = "DC-2026-001",
                    Name = "Direct Contracting for Enterprise Software Licenses",
                    BACProjectId = defaultProject.Id,
                    ExclusiveSupplierId = defaultSupplier.Id,
                    SubmissionDeadline = DateTime.UtcNow.AddDays(15),
                    Status = DirectContractingStatusEnum.FOR_REVIEW,
                    TotalABC = 1500000m,
                    ReviewRemarks = "Exclusive distributorship certificate verified."
                };

                context.DirectContractings.Add(dc);
                await context.SaveChangesAsync();
            }
        }
    }

    private static async Task SeedMarketScopingsAsync(ApplicationDbContext context)
    {
        if (context.MarketScopings != null && !await context.MarketScopings.AnyAsync())
        {
            var libActivities = await context.LineItemBudgetActivities!.ToListAsync();
            var defaultLibAct = libActivities.FirstOrDefault();

            var ms = new MarketScoping
            {
                Id = Guid.NewGuid(),
                ProjectName = "Market Scoping for High-Speed Fiber Backbone Equipment",
                EstimatedBudget = 3500000m,
                PeriodFrom = DateTime.UtcNow.AddDays(-30),
                PeriodTo = DateTime.UtcNow.AddDays(-10),
                DeliveryDate = DateTime.UtcNow.AddDays(60),
                TargetLineItemBudgetActivityId = defaultLibAct?.Id,
                Status = StatusEnum.Approved
            };

            context.MarketScopings.Add(ms);

            if (context.MarketScopingActivitySettings != null && !await context.MarketScopingActivitySettings.AnyAsync())
            {
                context.MarketScopingActivitySettings.Add(new MarketScopingActivitySettings
                {
                    Id = Guid.NewGuid(),
                    ActivityType = "Canvass",
                    Label = "Canvass of Prices",
                    Description = "Market canvass of potential vendors",
                    SortOrder = 1,
                    IsActive = true
                });
            }

            if (context.MarketScopingParameterSettings != null && !await context.MarketScopingParameterSettings.AnyAsync())
            {
                context.MarketScopingParameterSettings.Add(new MarketScopingParameterSettings
                {
                    Id = Guid.NewGuid(),
                    Name = "Warranty & Support",
                    GuidedQuestion = "Is manufacturer warranty provided for 1+ years?",
                    Description = "Evaluation of after-sales service and warranty terms",
                    SortOrder = 1,
                    IsActive = true
                });
            }

            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedKPIsAndPerformanceManagementAsync(ApplicationDbContext context)
    {
        var fys = await context.FiscalYears!.ToListAsync();
        var defaultFy = fys.FirstOrDefault(f => f.Year == 2026) ?? fys.FirstOrDefault();

        if (context.MFOPAPs != null && !await context.MFOPAPs.AnyAsync() && defaultFy != null)
        {
            var mfopap = new MFOPAP
            {
                Id = Guid.NewGuid(),
                Name = "Higher Education Program",
                Code = "MFO-1",
                Type = "MFO",
                IsActive = true,
                FiscalYearId = defaultFy.Id
            };
            context.MFOPAPs.Add(mfopap);
            await context.SaveChangesAsync();
        }

        var defaultMfopap = await context.MFOPAPs!.FirstOrDefaultAsync();

        if (context.KPIs != null && !await context.KPIs.AnyAsync())
        {
            var kpi = new KPI
            {
                Id = Guid.NewGuid(),
                Name = "Licensure Examination Passing Rate",
                Code = "KPI-HE-001",
                Description = "Percentage of first-time licensure exam takers who passed",
                MFOPAPId = defaultMfopap?.Id,
                Status = "Active"
            };

            context.KPIs.Add(kpi);
            await context.SaveChangesAsync();

            var offices = await context.Offices!.ToListAsync();
            var defaultOffice = offices.FirstOrDefault();

            if (defaultOffice != null && defaultFy != null && context.FYActiveKPIs != null)
            {
                var fyActiveKpi = new FYActiveKPI
                {
                    Id = Guid.NewGuid(),
                    MasterKPIId = kpi.Id,
                    FiscalYearId = defaultFy.Id,
                    AgencyTargetAnnual = 85.0m
                };
                context.FYActiveKPIs.Add(fyActiveKpi);
                await context.SaveChangesAsync();

                if (context.KPIAssignments != null)
                {
                    var kpiAssign = new KPIAssignment
                    {
                        Id = Guid.NewGuid(),
                        FYActiveKPIId = fyActiveKpi.Id,
                        OfficeId = defaultOffice.Id,
                        AssignedTargetAnnual = 85.0m
                    };
                    context.KPIAssignments.Add(kpiAssign);
                    await context.SaveChangesAsync();
                }
            }
        }

        if (context.Locations != null && !await context.Locations.AnyAsync())
        {
            context.Locations.Add(new Location
            {
                Id = Guid.NewGuid(),
                Name = "Main Campus - Lapasan",
                Code = "LOC-MAIN",
                Type = "Campus",
                IsActive = true
            });
            await context.SaveChangesAsync();
        }

        if (context.Clusters != null && !await context.Clusters.AnyAsync())
        {
            context.Clusters.Add(new Cluster
            {
                Id = Guid.NewGuid(),
                Name = "Academic Affairs Cluster",
                Code = "CL-ACAD",
                Address = "USTP Main Campus",
                IsActive = true
            });
            await context.SaveChangesAsync();
        }

        if (context.Set<SDG>() != null && !await context.Set<SDG>().AnyAsync())
        {
            var sdgs = new List<SDG>
            {
                new SDG { Id = Guid.NewGuid(), SdgCode = "SDG-4", Name = "Quality Education", Description = "Ensure inclusive and equitable quality education" },
                new SDG { Id = Guid.NewGuid(), SdgCode = "SDG-9", Name = "Industry, Innovation, & Infrastructure", Description = "Build resilient infrastructure and foster innovation" },
                new SDG { Id = Guid.NewGuid(), SdgCode = "SDG-11", Name = "Sustainable Cities & Communities", Description = "Make cities and settlements inclusive and sustainable" }
            };
            context.Set<SDG>().AddRange(sdgs);
            await context.SaveChangesAsync();
        }

        if (context.UNSPSCCodes != null && !await context.UNSPSCCodes.AnyAsync())
        {
            var unspscCodes = new List<UNSPSCCode>
            {
                new UNSPSCCode { Id = Guid.NewGuid(), Code = "44120000", Name = "Office Supplies", Description = "Paper, pens, and office consumables", Level = 2, IsActive = true },
                new UNSPSCCode { Id = Guid.NewGuid(), Code = "43210000", Name = "Computer Equipment", Description = "Desktops, laptops, and networking hardware", Level = 2, IsActive = true },
                new UNSPSCCode { Id = Guid.NewGuid(), Code = "41110000", Name = "Laboratory Equipment", Description = "Microscopes, spectrometers, and lab instruments", Level = 2, IsActive = true }
            };
            context.UNSPSCCodes.AddRange(unspscCodes);
            await context.SaveChangesAsync();
        }

        if (context.SupplierRequirements != null && !await context.SupplierRequirements.AnyAsync())
        {
            var suppliers = await context.Suppliers!.ToListAsync();
            var defaultSupplier = suppliers.FirstOrDefault();

            if (defaultSupplier != null)
            {
                var reqs = new List<SupplierRequirement>
                {
                    new SupplierRequirement { Id = Guid.NewGuid(), SupplierId = defaultSupplier.Id, RequirementName = "PhilGEPS Platinum Registration Certificate", Url = "https://example.gov.ph/docs/philgeps.pdf", IsVerified = true },
                    new SupplierRequirement { Id = Guid.NewGuid(), SupplierId = defaultSupplier.Id, RequirementName = "Mayor's / Business Permit (Current Year)", Url = "https://example.gov.ph/docs/mayors-permit.pdf", IsVerified = true },
                    new SupplierRequirement { Id = Guid.NewGuid(), SupplierId = defaultSupplier.Id, RequirementName = "Tax Clearance Certificate per E.O. 398", Url = "https://example.gov.ph/docs/tax-clearance.pdf", IsVerified = true }
                };
                context.SupplierRequirements.AddRange(reqs);
                await context.SaveChangesAsync();
            }
        }

        if (context.RatingScaleTemplates != null && !await context.RatingScaleTemplates.AnyAsync())
        {
            var template = new RatingScaleTemplate
            {
                Id = Guid.NewGuid(),
                Name = "SPMS Standard 5-Point Rating Scale",
                Description = "Standard Strategic Performance Management System Rating Scale (1 to 5)",
                IsFixed = true,
                IsDefault = true
            };
            context.RatingScaleTemplates.Add(template);
            await context.SaveChangesAsync();
        }
    }
}
