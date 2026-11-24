using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.AMS;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Constants;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Infrastructure.Persistence.Seeders;

public static class AmsRoleSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (context.AmsRoles == null || context.AmsRolePermissions == null)
        {
            return;
        }

        var defaultRoles = new Dictionary<string, (string Description, IReadOnlyList<string> Permissions)>
        {
            ["System Administrator"] = (
                "Full operational administrator across all Dashboard modules and access control.",
                Permissions.GetAllPermissions()
            ),
            ["Planning Officer"] = (
                "Responsible for WFP, OPCR, KPI, and PPMP preparation and submission.",
                [
                    Permissions.Planning.viewGlobalDashboard,
                    Permissions.Planning.viewOfficeDashboard,
                    Permissions.Planning.libCreate,
                    Permissions.Planning.libView,
                    Permissions.Planning.libUpdate,
                    Permissions.Planning.libSubmit,
                    Permissions.Planning.wfpCreate,
                    Permissions.Planning.wfpView,
                    Permissions.Planning.wfpUpdate,
                    Permissions.Planning.wfpSubmit,
                    Permissions.Planning.opcrCreate,
                    Permissions.Planning.opcrView,
                    Permissions.Planning.opcrUpdate,
                    Permissions.Planning.opcrSubmit,
                    Permissions.Planning.opcrEvaluate,
                    Permissions.Planning.kpiCreate,
                    Permissions.Planning.kpiView,
                    Permissions.Planning.kpiUpdate,
                    Permissions.Planning.kpiAssign,
                    Permissions.Planning.targetManage,
                    Permissions.Planning.ratingScaleManage,
                    Permissions.Planning.fiscalYearView,
                    Permissions.Planning.budgetCallView,
                    Permissions.Planning.marketScopingView,
                    Permissions.Planning.marketScopingManage,
                    Permissions.Planning.marketScopingSubmit,
                    Permissions.Procurement.ppmpCreate,
                    Permissions.Procurement.ppmpView,
                    Permissions.Procurement.ppmpUpdate,
                    Permissions.Procurement.ppmpSubmit
                ]
            ),
            ["Budget Officer"] = (
                "Oversees Line Item Budgets, agency ceiling allocations, and expenditure accounts.",
                [
                    Permissions.Planning.viewGlobalDashboard,
                    Permissions.Planning.viewOfficeDashboard,
                    Permissions.Planning.libView,
                    Permissions.Planning.libUpdate,
                    Permissions.Planning.libApprove,
                    Permissions.Planning.libAmend,
                    Permissions.Finance.agencyMasterBudgetManage,
                    Permissions.Finance.budgetCeilingAssign,
                    Permissions.Finance.subOfficeCeilingAssign,
                    Permissions.Finance.fiscalMonthLockUnlock,
                    Permissions.Finance.uacsView,
                    Permissions.Finance.uacsManage,
                    Permissions.Finance.fundSourceManage,
                    Permissions.Procurement.ppmpView
                ]
            ),
            ["Procurement Officer"] = (
                "Manages consolidated PPMPs, RFQs, BAC activities, purchase orders, and supplier catalogs.",
                [
                    Permissions.Procurement.ppmpView,
                    Permissions.Procurement.ppmpConsolidate,
                    Permissions.Procurement.ppmpReview,
                    Permissions.Procurement.ppmpApprove,
                    Permissions.Procurement.appManage,
                    Permissions.Procurement.prCreate,
                    Permissions.Procurement.prManage,
                    Permissions.Procurement.rfqManage,
                    Permissions.Procurement.bacManage,
                    Permissions.Procurement.aobManage,
                    Permissions.Procurement.poManage,
                    Permissions.Procurement.procurementLibraryView,
                    Permissions.Procurement.procurementLibraryManage,
                    Permissions.Procurement.procurementThresholdsManage,
                    Permissions.Procurement.biddingDocumentsView,
                    Permissions.Procurement.biddingDocumentsManage,
                    Permissions.Procurement.supplierView,
                    Permissions.Procurement.supplierManage
                ]
            ),
            ["BAC Member"] = (
                "Bids and Awards Committee member evaluating resolutions, abstracts of bids, and post-qualifications.",
                [
                    Permissions.Procurement.bacManage,
                    Permissions.Procurement.aobManage,
                    Permissions.Procurement.biddingDocumentsView,
                    Permissions.Procurement.supplierView
                ]
            ),
            ["Executive Approver"] = (
                "Executive authority with approval privileges over plans, budgets, and contracts.",
                [
                    Permissions.Planning.viewGlobalDashboard,
                    Permissions.Planning.libApprove,
                    Permissions.Planning.wfpApprove,
                    Permissions.Planning.opcrApprove,
                    Permissions.Planning.marketScopingApprove,
                    Permissions.Procurement.ppmpApprove
                ]
            ),
            ["Employee / Viewer"] = (
                "Default standard user with read-only operational visibility.",
                [
                    Permissions.Planning.viewOfficeDashboard,
                    Permissions.Planning.fiscalYearView,
                    Permissions.Planning.budgetCallView,
                    Permissions.Procurement.ppmpView,
                    Permissions.Procurement.biddingDocumentsView
                ]
            )
        };

        foreach (var (roleName, (description, perms)) in defaultRoles)
        {
            var role = await context.AmsRoles.FirstOrDefaultAsync(r => r.Name == roleName);
            if (role == null)
            {
                role = new AmsRole
                {
                    Id = Guid.NewGuid(),
                    Name = roleName,
                    Description = description,
                    IsSystemRole = true,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "SystemSeed"
                };

                await context.AmsRoles.AddAsync(role);

                foreach (var perm in perms.Distinct())
                {
                    await context.AmsRolePermissions.AddAsync(new AmsRolePermission
                    {
                        Id = Guid.NewGuid(),
                        RoleId = role.Id,
                        PermissionKey = perm,
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = "SystemSeed"
                    });
                }
            }
        }

        // Enforce strict licensing: clean up any legacy permissive development Enterprise license
        if (context.AmsLicenseSettings != null)
        {
            var legacyDevLicenses = await context.AmsLicenseSettings
                .Where(s => s.LicenseKey == "EPZ-ENTERPRISE-DEVELOPMENT-LICENSE-KEY")
                .ToListAsync();

            if (legacyDevLicenses.Count > 0)
            {
                context.AmsLicenseSettings.RemoveRange(legacyDevLicenses);
            }
        }

        await context.SaveChangesAsync();
    }
}

public static partial class ApprovalAndSignatorySeeder
{
    public static Guid NextJumpSolutionsTenantId { get; } = Guid.Parse("01a0d69d-924b-762c-a774-523a30544619");

    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (context.PositionTypes == null || context.PlantillaTypes == null ||
            context.SalaryGrades == null || context.Steps == null ||
            context.OfficeTypes == null || context.Categories == null ||
            context.AdministrativeLevels == null || context.Offices == null ||
            context.Positions == null || context.Users == null ||
            context.PersonnelPositions == null || context.FiscalYears == null ||
            context.Organizations == null || context.WorkflowMatrices == null ||
            context.PMTs == null || context.PMTMembers == null)
        {
            return;
        }

        // Ensure AMS roles exist first so role assignments can be linked
        await AmsRoleSeeder.SeedAsync(context);

        var originalTenantId = context.CurrentTenantId;
        try
        {
            var tenantIds = new HashSet<Guid>
            {
                ApplicationDbContext.DefaultTestTenantId,
                NextJumpSolutionsTenantId
            };

            if (originalTenantId.HasValue && originalTenantId.Value != Guid.Empty)
            {
                tenantIds.Add(originalTenantId.Value);
            }

            var officeTenantIds = await context.Offices.IgnoreQueryFilters()
                .Where(o => o.TenantId != Guid.Empty)
                .Select(o => o.TenantId)
                .Distinct()
                .ToListAsync();
            foreach (var tid in officeTenantIds) tenantIds.Add(tid);

            var fyTenantIds = await context.FiscalYears.IgnoreQueryFilters()
                .Where(fy => fy.TenantId != Guid.Empty)
                .Select(fy => fy.TenantId)
                .Distinct()
                .ToListAsync();
            foreach (var tid in fyTenantIds) tenantIds.Add(tid);

            // Seed DefaultTestTenantId first, then real tenants last so shared User.OfficeId points to active tenant offices
            var orderedTenants = tenantIds
                .OrderBy(t => t == ApplicationDbContext.DefaultTestTenantId ? 0 : 1)
                .ThenBy(t => t == NextJumpSolutionsTenantId ? 1 : 0)
                .ToList();

            foreach (var tenantId in orderedTenants)
            {
                context.CurrentTenantId = tenantId;
                await SeedTenantOrganizationAndSignatoriesAsync(context, tenantId);
            }
        }
        finally
        {
            context.CurrentTenantId = originalTenantId;
        }
    }

    private static async Task SeedTenantOrganizationAndSignatoriesAsync(
        ApplicationDbContext context,
        Guid tenantId)
    {
        var isPrimaryRealTenant = tenantId != ApplicationDbContext.DefaultTestTenantId;

        // 1. Seed BAC Members (Chairperson, ViceChairperson, 3 RegularMembers) for this tenant
        if (context.BACMembers != null && !await context.BACMembers.AnyAsync())
        {
            var bacMembers = new List<BACMember>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    FullName = "ENGR. CARLOS M. REYES, Ph.D.",
                    Position = "BAC Chairperson / VP for Administration",
                    Role = "Chairperson",
                    Order = 1,
                    IsActive = true
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    FullName = "ATTY. ELENA G. SANTOS",
                    Position = "BAC Vice-Chairperson / Chief Procurement Officer",
                    Role = "ViceChairperson",
                    Order = 2,
                    IsActive = true
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    FullName = "DR. ROBERTO L. MENDOZA",
                    Position = "BAC Regular Member / Dean of Engineering",
                    Role = "RegularMember",
                    Order = 3,
                    IsActive = true
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    FullName = "MS. PATRICIA A. CRUZ, CPA",
                    Position = "BAC Regular Member / Chief Administrative Officer",
                    Role = "RegularMember",
                    Order = 4,
                    IsActive = true
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    FullName = "MR. ANTONIO D. VILLANUEVA",
                    Position = "BAC Regular Member / IT Officer II",
                    Role = "RegularMember",
                    Order = 5,
                    IsActive = true
                }
            };

            await context.BACMembers.AddRangeAsync(bacMembers);
            await context.SaveChangesAsync();
        }

        // 2. Lookup tables (BaseEntity - shared across tenants)
        var execPositionType = await context.PositionTypes!.FirstOrDefaultAsync(x => x.Code == "EXEC")
            ?? await context.PositionTypes!.FirstOrDefaultAsync();
        var mgrPositionType = await context.PositionTypes!.FirstOrDefaultAsync(x => x.Code == "MGR")
            ?? execPositionType;
        var supPositionType = await context.PositionTypes!.FirstOrDefaultAsync(x => x.Code == "SUP")
            ?? execPositionType;
        var techPositionType = await context.PositionTypes!.FirstOrDefaultAsync(x => x.Code == "TECH")
            ?? supPositionType;
        var permPlantilla = await context.PlantillaTypes!.FirstOrDefaultAsync(x => x.Code == "PERM")
            ?? await context.PlantillaTypes!.FirstOrDefaultAsync();
        var defaultSg = await context.SalaryGrades!.FirstOrDefaultAsync(x => x.GradeNumber == 24)
            ?? await context.SalaryGrades!.FirstOrDefaultAsync();
        var sg26 = await context.SalaryGrades!.FirstOrDefaultAsync(x => x.GradeNumber == 26) ?? defaultSg;
        var sg22 = await context.SalaryGrades!.FirstOrDefaultAsync(x => x.GradeNumber == 22) ?? defaultSg;
        var sg18 = await context.SalaryGrades!.FirstOrDefaultAsync(x => x.GradeNumber == 18) ?? defaultSg;
        var defaultStep = await context.Steps!.FirstOrDefaultAsync(x => x.StepNumber == 1)
            ?? await context.Steps!.FirstOrDefaultAsync();

        var deptOfficeType = await context.OfficeTypes!.FirstOrDefaultAsync(x => x.Code == "DEPT" || x.Code == "OFF")
            ?? await context.OfficeTypes!.FirstOrDefaultAsync();
        var servOfficeType = await context.OfficeTypes!.FirstOrDefaultAsync(x => x.Code == "SERV")
            ?? deptOfficeType;
        var divOfficeType = await context.OfficeTypes!.FirstOrDefaultAsync(x => x.Code == "DIV")
            ?? deptOfficeType;

        var mainCategory = await context.Categories!.FirstOrDefaultAsync(x => x.Code == "MAIN" || x.Code == "ADMIN")
            ?? await context.Categories!.FirstOrDefaultAsync();
        var supCategory = await context.Categories!.FirstOrDefaultAsync(x => x.Code == "SUP")
            ?? mainCategory;
        var duCategory = await context.Categories!.FirstOrDefaultAsync(x => x.Code == "DU")
            ?? mainCategory;

        var centAdminLevel = await context.AdministrativeLevels!.FirstOrDefaultAsync(x => x.Code == "CENT" || x.Code == "NAT" || x.Code == "NGA")
            ?? await context.AdministrativeLevels!.FirstOrDefaultAsync();
        var divAdminLevel = await context.AdministrativeLevels!.FirstOrDefaultAsync(x => x.Code == "DIV-LVL" || x.Code == "LVL2")
            ?? centAdminLevel;

        if (execPositionType == null || permPlantilla == null || defaultSg == null ||
            defaultStep == null || deptOfficeType == null || mainCategory == null ||
            centAdminLevel == null)
        {
            return;
        }

        // Load AMS roles dictionary for role assignments
        var rolesByName = context.AmsRoles != null
            ? await context.AmsRoles.ToDictionaryAsync(r => r.Name, r => r.Id)
            : new Dictionary<string, Guid>();

        // 3. Ensure Fiscal Year exists for this tenant
        var currentYear = DateTime.UtcNow.Year;
        var fiscalYear = await context.FiscalYears!.FirstOrDefaultAsync(fy => fy.Year == currentYear)
            ?? await context.FiscalYears!.OrderByDescending(fy => fy.Year).FirstOrDefaultAsync();

        if (fiscalYear == null)
        {
            fiscalYear = new FiscalYear
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Year = currentYear,
                Description = $"Fiscal Year {currentYear}",
                Status = "Active",
                IsLocked = false,
                StartDate = new DateTime(currentYear, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(currentYear, 12, 31, 23, 59, 59, DateTimeKind.Utc)
            };
            await context.FiscalYears!.AddAsync(fiscalYear);
            await context.SaveChangesAsync();
        }

        // 4. Ensure Organization exists
        var existingTenantOffice = await context.Offices!.FirstOrDefaultAsync();
        Organization? organization = null;
        if (existingTenantOffice != null)
        {
            organization = await context.Organizations!.FirstOrDefaultAsync(o => o.Id == existingTenantOffice.OrganizationId);
        }
        organization ??= await context.Organizations!.FirstOrDefaultAsync();

        if (organization == null)
        {
            organization = new Organization
            {
                Id = Guid.NewGuid(),
                Name = "State University & Procuring Entity",
                Code = "SUPE",
                Type = "Agency",
                IsActive = true,
                FiscalYearId = fiscalYear.Id
            };
            await context.Organizations!.AddAsync(organization);
            await context.SaveChangesAsync();
        }

        // 5. Ensure Complete Organizational Offices Exist for this Tenant
        var mainOffice = await EnsureOfficeAsync(
            context, tenantId, "Office of the President", "OP", organization.Id,
            deptOfficeType.Id, mainCategory.Id, centAdminLevel.Id);

        var ovppfOffice = await EnsureOfficeAsync(
            context, tenantId, "Office of the Vice President for Planning and Finance", "OVPPF", organization.Id,
            deptOfficeType.Id, mainCategory.Id, centAdminLevel.Id, mainOffice.Id);

        var afmsOffice = await EnsureOfficeAsync(
            context, tenantId, "Administrative and Financial Management Service", "AFMS", organization.Id,
            servOfficeType!.Id, supCategory!.Id, centAdminLevel.Id, ovppfOffice.Id);

        var fmsOffice = await EnsureOfficeAsync(
            context, tenantId, "Financial Management Services", "FMS", organization.Id,
            servOfficeType.Id, supCategory.Id, centAdminLevel.Id, ovppfOffice.Id);

        var pmdOffice = await EnsureOfficeAsync(
            context, tenantId, "Planning and Management Division", "PMD-01", organization.Id,
            divOfficeType!.Id, duCategory!.Id, divAdminLevel!.Id, ovppfOffice.Id);

        var ictdOffice = await EnsureOfficeAsync(
            context, tenantId, "Information and Communications Technology Division", "ICTD", organization.Id,
            divOfficeType.Id, duCategory.Id, divAdminLevel.Id, afmsOffice.Id);

        var itsdOffice = await EnsureOfficeAsync(
            context, tenantId, "Information Technology Services Division", "ITSD-MAIN", organization.Id,
            divOfficeType.Id, duCategory.Id, divAdminLevel.Id, afmsOffice.Id);

        var gspdOffice = await EnsureOfficeAsync(
            context, tenantId, "General Services and Procurement Division", "GSPD", organization.Id,
            divOfficeType.Id, supCategory.Id, divAdminLevel.Id, afmsOffice.Id);

        var spmoOffice = await EnsureOfficeAsync(
            context, tenantId, "Supply and Property Management Office", "SPMO", organization.Id,
            divOfficeType.Id, supCategory.Id, divAdminLevel.Id, afmsOffice.Id);

        var bacOffice = await EnsureOfficeAsync(
            context, tenantId, "Bids and Awards Committee Office", "BAC", organization.Id,
            divOfficeType.Id, supCategory.Id, centAdminLevel.Id, mainOffice.Id);

        var office1 = await EnsureOfficeAsync(
            context, tenantId, "Office 1", "OFN-XXX-001", organization.Id,
            divOfficeType.Id, duCategory.Id, divAdminLevel.Id, mainOffice.Id);

        // 6. Seed Complete Positions, Users, PersonnelPositions, and AMS Role Assignments across all Offices
        // ── Office of the President (OP) ──
        var hopePosition = await EnsureSignatoryPositionAndPersonnelAsync(
            context, tenantId, isPrimaryRealTenant, rolesByName,
            positionCode: "POS-HOPE-01",
            positionTitle: "Head of the Procuring Entity",
            functionalTitle: "University President / HOPE",
            officeId: mainOffice.Id,
            positionTypeId: execPositionType.Id,
            plantillaTypeId: permPlantilla.Id,
            salaryGradeId: sg26!.Id,
            stepId: defaultStep.Id,
            employeeNumber: "EMP-SIGN-001",
            username: "hope.approver",
            email: "hope@erpez.gov.ph",
            firstName: "DR. ALEJANDRO",
            middleName: "V.",
            lastName: "DELA CRUZ",
            amsRoleNames: ["Executive Approver", "System Administrator"]);

        await EnsureSignatoryPositionAndPersonnelAsync(
            context, tenantId, isPrimaryRealTenant, rolesByName,
            positionCode: "POS-OP-COS",
            positionTitle: "Chief of Staff, Office of the President",
            functionalTitle: "Executive Assistant V",
            officeId: mainOffice.Id,
            positionTypeId: mgrPositionType!.Id,
            plantillaTypeId: permPlantilla.Id,
            salaryGradeId: defaultSg.Id,
            stepId: defaultStep.Id,
            employeeNumber: "EMP-OP-002",
            username: "marco.villaruel",
            email: "cos@erpez.gov.ph",
            firstName: "ATTY. MARCO",
            middleName: "A.",
            lastName: "VILLARUEL",
            amsRoleNames: ["Executive Approver", "Planning Officer"]);

        // ── Office of the VP for Planning & Finance (OVPPF) ──
        var recommendingPosition = await EnsureSignatoryPositionAndPersonnelAsync(
            context, tenantId, isPrimaryRealTenant, rolesByName,
            positionCode: "POS-REC-01",
            positionTitle: "Campus Chancellor",
            functionalTitle: "Vice President for Planning & Finance",
            officeId: ovppfOffice.Id,
            positionTypeId: execPositionType.Id,
            plantillaTypeId: permPlantilla.Id,
            salaryGradeId: sg26.Id,
            stepId: defaultStep.Id,
            employeeNumber: "EMP-SIGN-002",
            username: "recommending.approver",
            email: "chancellor@erpez.gov.ph",
            firstName: "DR. MARIA",
            middleName: "L.",
            lastName: "FERNANDEZ",
            amsRoleNames: ["Executive Approver", "Planning Officer", "Budget Officer"]);

        // ── Administrative and Financial Management Service (AFMS) ──
        await EnsureSignatoryPositionAndPersonnelAsync(
            context, tenantId, isPrimaryRealTenant, rolesByName,
            positionCode: "POS-AFMS-DIR",
            positionTitle: "Director, Administrative and Financial Management Service",
            functionalTitle: "Service Director / Chief Administrative Officer",
            officeId: afmsOffice.Id,
            positionTypeId: mgrPositionType.Id,
            plantillaTypeId: permPlantilla.Id,
            salaryGradeId: sg26.Id,
            stepId: defaultStep.Id,
            employeeNumber: "EMP-AFMS-001",
            username: "ricardo.montemayor",
            email: "afms.director@erpez.gov.ph",
            firstName: "DR. RICARDO",
            middleName: "G.",
            lastName: "MONTEMAYOR, CPA",
            amsRoleNames: ["Executive Approver", "Budget Officer"]);

        await EnsureSignatoryPositionAndPersonnelAsync(
            context, tenantId, isPrimaryRealTenant, rolesByName,
            positionCode: "POS-AFMS-BO",
            positionTitle: "Supervising Administrative Officer (Budget)",
            functionalTitle: "Budget Officer IV",
            officeId: afmsOffice.Id,
            positionTypeId: supPositionType!.Id,
            plantillaTypeId: permPlantilla.Id,
            salaryGradeId: sg22!.Id,
            stepId: defaultStep.Id,
            employeeNumber: "EMP-AFMS-002",
            username: "clarissa.valdez",
            email: "afms.budget@erpez.gov.ph",
            firstName: "MS. CLARISSA",
            middleName: "M.",
            lastName: "VALDEZ, CPA",
            amsRoleNames: ["Budget Officer", "Planning Officer"]);

        // ── Financial Management Services (FMS) ──
        var financePosition = await EnsureSignatoryPositionAndPersonnelAsync(
            context, tenantId, isPrimaryRealTenant, rolesByName,
            positionCode: "POS-FIN-01",
            positionTitle: "Director of Financial Management Services",
            functionalTitle: "Chief Budget Officer / Accountant",
            officeId: fmsOffice.Id,
            positionTypeId: mgrPositionType.Id,
            plantillaTypeId: permPlantilla.Id,
            salaryGradeId: sg26.Id,
            stepId: defaultStep.Id,
            employeeNumber: "EMP-SIGN-003",
            username: "finance.director",
            email: "finance@erpez.gov.ph",
            firstName: "HONORATA",
            middleName: "S.",
            lastName: "BAUTISTA, CPA",
            amsRoleNames: ["Budget Officer", "Executive Approver"]);

        // ── Planning and Management Division (PMD-01) ──
        await EnsureSignatoryPositionAndPersonnelAsync(
            context, tenantId, isPrimaryRealTenant, rolesByName,
            positionCode: "POS-PMD-CHIEF",
            positionTitle: "Division Chief, Planning and Management Division",
            functionalTitle: "Chief Planning Officer",
            officeId: pmdOffice.Id,
            positionTypeId: mgrPositionType.Id,
            plantillaTypeId: permPlantilla.Id,
            salaryGradeId: defaultSg.Id,
            stepId: defaultStep.Id,
            employeeNumber: "EMP-PMD-001",
            username: "rafael.navarro",
            email: "pmd.chief@erpez.gov.ph",
            firstName: "ENGR. RAFAEL",
            middleName: "C.",
            lastName: "NAVARRO, EnP",
            amsRoleNames: ["Planning Officer", "Executive Approver"]);

        await EnsureSignatoryPositionAndPersonnelAsync(
            context, tenantId, isPrimaryRealTenant, rolesByName,
            positionCode: "PO-003",
            positionTitle: "Planning Officer III",
            functionalTitle: "Senior Corporate Planning Specialist",
            officeId: pmdOffice.Id,
            positionTypeId: techPositionType!.Id,
            plantillaTypeId: permPlantilla.Id,
            salaryGradeId: sg18!.Id,
            stepId: defaultStep.Id,
            employeeNumber: "EMP-PMD-002",
            username: "katrina.soriano",
            email: "katrina.soriano@erpez.gov.ph",
            firstName: "MS. KATRINA",
            middleName: "B.",
            lastName: "SORIANO",
            amsRoleNames: ["Planning Officer"]);

        await EnsureSignatoryPositionAndPersonnelAsync(
            context, tenantId, isPrimaryRealTenant, rolesByName,
            positionCode: "AO-005",
            positionTitle: "Administrative Officer V",
            functionalTitle: "Planning & Evaluation Officer",
            officeId: pmdOffice.Id,
            positionTypeId: supPositionType.Id,
            plantillaTypeId: permPlantilla.Id,
            salaryGradeId: sg18.Id,
            stepId: defaultStep.Id,
            employeeNumber: "EMP-PMD-003",
            username: "miguel.ocampo",
            email: "miguel.ocampo@erpez.gov.ph",
            firstName: "MR. MIGUEL",
            middleName: "D.",
            lastName: "OCAMPO",
            amsRoleNames: ["Planning Officer", "Budget Officer"]);

        // ── Information and Communications Technology Division (ICTD) ──
        var ictdChief = await EnsureSignatoryPositionAndPersonnelAsync(
            context, tenantId, isPrimaryRealTenant, rolesByName,
            positionCode: "POS-ICTD-CHIEF",
            positionTitle: "Division Chief, Information and Communications Technology Division",
            functionalTitle: "Information Technology Officer III / Division Chief",
            officeId: ictdOffice.Id,
            positionTypeId: mgrPositionType.Id,
            plantillaTypeId: permPlantilla.Id,
            salaryGradeId: defaultSg.Id,
            stepId: defaultStep.Id,
            employeeNumber: "EMP-ICTD-001",
            username: "alex.maureal",
            email: "alex.maureal@erpez.gov.ph",
            firstName: "ENGR. ALEX",
            middleName: "L.",
            lastName: "MAUREAL",
            amsRoleNames: ["Planning Officer", "Procurement Officer", "System Administrator"]);

        await EnsureSignatoryPositionAndPersonnelAsync(
            context, tenantId, isPrimaryRealTenant, rolesByName,
            positionCode: "POS-ICTD-ITO2",
            positionTitle: "Information Technology Officer II",
            functionalTitle: "Systems & Network Section Head / BAC Regular Member",
            officeId: ictdOffice.Id,
            positionTypeId: supPositionType.Id,
            plantillaTypeId: permPlantilla.Id,
            salaryGradeId: sg22.Id,
            stepId: defaultStep.Id,
            employeeNumber: "EMP-ICTD-002",
            username: "antonio.villanueva",
            email: "antonio.villanueva@erpez.gov.ph",
            firstName: "MR. ANTONIO",
            middleName: "D.",
            lastName: "VILLANUEVA",
            amsRoleNames: ["BAC Member", "Planning Officer"]);

        await EnsureSignatoryPositionAndPersonnelAsync(
            context, tenantId, isPrimaryRealTenant, rolesByName,
            positionCode: "POS-ICTD-ISA3",
            positionTitle: "Information Systems Analyst III",
            functionalTitle: "ICT Planning & Procurement Coordinator",
            officeId: ictdOffice.Id,
            positionTypeId: techPositionType.Id,
            plantillaTypeId: permPlantilla.Id,
            salaryGradeId: sg18.Id,
            stepId: defaultStep.Id,
            employeeNumber: "EMP-ICTD-003",
            username: "bianca.tolentino",
            email: "bianca.tolentino@erpez.gov.ph",
            firstName: "MS. BIANCA",
            middleName: "R.",
            lastName: "TOLENTINO",
            amsRoleNames: ["Planning Officer", "Procurement Officer"]);

        // ── Information Technology Services Division (ITSD-MAIN) ──
        var itsdChief = await EnsureSignatoryPositionAndPersonnelAsync(
            context, tenantId, isPrimaryRealTenant, rolesByName,
            positionCode: "POS-ITSD-CHIEF",
            positionTitle: "Division Chief, Information Technology Services Division",
            functionalTitle: "Chief IT Services Officer",
            officeId: itsdOffice.Id,
            positionTypeId: mgrPositionType.Id,
            plantillaTypeId: permPlantilla.Id,
            salaryGradeId: defaultSg.Id,
            stepId: defaultStep.Id,
            employeeNumber: "EMP-ITSD-001",
            username: "gabriel.mercado",
            email: "gabriel.mercado@erpez.gov.ph",
            firstName: "ENGR. GABRIEL",
            middleName: "T.",
            lastName: "MERCADO, MIT",
            amsRoleNames: ["Planning Officer", "Procurement Officer", "Executive Approver"]);

        await EnsureSignatoryPositionAndPersonnelAsync(
            context, tenantId, isPrimaryRealTenant, rolesByName,
            positionCode: "POS-ITSD-SPEC",
            positionTitle: "Senior IT Specialist",
            functionalTitle: "IT Project & Procurement Lead",
            officeId: itsdOffice.Id,
            positionTypeId: techPositionType.Id,
            plantillaTypeId: permPlantilla.Id,
            salaryGradeId: sg18.Id,
            stepId: defaultStep.Id,
            employeeNumber: "EMP-ITSD-002",
            username: "paolo.castillo",
            email: "paolo.castillo@erpez.gov.ph",
            firstName: "MR. PAOLO",
            middleName: "J.",
            lastName: "CASTILLO",
            amsRoleNames: ["Planning Officer", "Procurement Officer"]);

        // ── General Services and Procurement Division (GSPD) ──
        await EnsureSignatoryPositionAndPersonnelAsync(
            context, tenantId, isPrimaryRealTenant, rolesByName,
            positionCode: "POS-GSPD-CHIEF",
            positionTitle: "Division Chief, General Services and Procurement Division",
            functionalTitle: "Chief Procurement Officer / BAC Vice-Chairperson",
            officeId: gspdOffice.Id,
            positionTypeId: mgrPositionType.Id,
            plantillaTypeId: permPlantilla.Id,
            salaryGradeId: defaultSg.Id,
            stepId: defaultStep.Id,
            employeeNumber: "EMP-GSPD-001",
            username: "elena.santos",
            email: "elena.santos@erpez.gov.ph",
            firstName: "ATTY. ELENA",
            middleName: "G.",
            lastName: "SANTOS",
            amsRoleNames: ["Procurement Officer", "BAC Member", "Executive Approver"]);

        await EnsureSignatoryPositionAndPersonnelAsync(
            context, tenantId, isPrimaryRealTenant, rolesByName,
            positionCode: "POS-GSPD-PROC",
            positionTitle: "Procurement Management Officer IV",
            functionalTitle: "Senior Buyer / Canvasser",
            officeId: gspdOffice.Id,
            positionTypeId: supPositionType.Id,
            plantillaTypeId: permPlantilla.Id,
            salaryGradeId: sg22.Id,
            stepId: defaultStep.Id,
            employeeNumber: "EMP-GSPD-002",
            username: "theresa.salazar",
            email: "theresa.salazar@erpez.gov.ph",
            firstName: "MS. THERESA",
            middleName: "L.",
            lastName: "SALAZAR",
            amsRoleNames: ["Procurement Officer"]);

        // ── Supply and Property Management Office (SPMO) ──
        var supplyPosition = await EnsureSignatoryPositionAndPersonnelAsync(
            context, tenantId, isPrimaryRealTenant, rolesByName,
            positionCode: "POS-SUP-01",
            positionTitle: "Agency Property/Supply Officer",
            functionalTitle: "Head, Supply and Property Management Office",
            officeId: spmoOffice.Id,
            positionTypeId: supPositionType.Id,
            plantillaTypeId: permPlantilla.Id,
            salaryGradeId: defaultSg.Id,
            stepId: defaultStep.Id,
            employeeNumber: "EMP-SIGN-004",
            username: "supply.officer",
            email: "supply@erpez.gov.ph",
            firstName: "ERNESTO",
            middleName: "P.",
            lastName: "RAMOS",
            amsRoleNames: ["Procurement Officer", "Employee / Viewer"]);

        // ── Bids and Awards Committee Office (BAC) ──
        var bacChairPosition = await EnsureSignatoryPositionAndPersonnelAsync(
            context, tenantId, isPrimaryRealTenant, rolesByName,
            positionCode: "POS-BAC-CHAIR",
            positionTitle: "BAC Chairperson",
            functionalTitle: "Chairperson, Bids and Awards Committee",
            officeId: bacOffice.Id,
            positionTypeId: mgrPositionType.Id,
            plantillaTypeId: permPlantilla.Id,
            salaryGradeId: sg26.Id,
            stepId: defaultStep.Id,
            employeeNumber: "EMP-SIGN-005",
            username: "bac.chairperson",
            email: "bac.chair@erpez.gov.ph",
            firstName: "ENGR. CARLOS",
            middleName: "M.",
            lastName: "REYES, Ph.D.",
            amsRoleNames: ["BAC Member", "Executive Approver"]);

        var bacSecPosition = await EnsureSignatoryPositionAndPersonnelAsync(
            context, tenantId, isPrimaryRealTenant, rolesByName,
            positionCode: "POS-BAC-SEC",
            positionTitle: "Head, BAC Secretariat",
            functionalTitle: "Procurement Officer / BAC Secretariat Head",
            officeId: bacOffice.Id,
            positionTypeId: supPositionType.Id,
            plantillaTypeId: permPlantilla.Id,
            salaryGradeId: sg22.Id,
            stepId: defaultStep.Id,
            employeeNumber: "EMP-SIGN-006",
            username: "bac.secretariat",
            email: "bac.sec@erpez.gov.ph",
            firstName: "LORENA",
            middleName: "T.",
            lastName: "AQUINO",
            amsRoleNames: ["BAC Member", "Procurement Officer"]);

        await EnsureSignatoryPositionAndPersonnelAsync(
            context, tenantId, isPrimaryRealTenant, rolesByName,
            positionCode: "POS-BAC-MEM1",
            positionTitle: "BAC Regular Member (Technical)",
            functionalTitle: "Dean of Engineering / BAC Regular Member",
            officeId: bacOffice.Id,
            positionTypeId: mgrPositionType.Id,
            plantillaTypeId: permPlantilla.Id,
            salaryGradeId: defaultSg.Id,
            stepId: defaultStep.Id,
            employeeNumber: "EMP-BAC-003",
            username: "roberto.mendoza",
            email: "roberto.mendoza@erpez.gov.ph",
            firstName: "DR. ROBERTO",
            middleName: "L.",
            lastName: "MENDOZA",
            amsRoleNames: ["BAC Member"]);

        await EnsureSignatoryPositionAndPersonnelAsync(
            context, tenantId, isPrimaryRealTenant, rolesByName,
            positionCode: "POS-BAC-MEM2",
            positionTitle: "BAC Regular Member (Finance & Admin)",
            functionalTitle: "Chief Administrative Officer / BAC Regular Member",
            officeId: bacOffice.Id,
            positionTypeId: mgrPositionType.Id,
            plantillaTypeId: permPlantilla.Id,
            salaryGradeId: defaultSg.Id,
            stepId: defaultStep.Id,
            employeeNumber: "EMP-BAC-004",
            username: "patricia.cruz",
            email: "patricia.cruz@erpez.gov.ph",
            firstName: "MS. PATRICIA",
            middleName: "A.",
            lastName: "CRUZ, CPA",
            amsRoleNames: ["BAC Member", "Budget Officer"]);

        // ── Office 1 (OFN-XXX-001) ──
        var office1Chief = await EnsureSignatoryPositionAndPersonnelAsync(
            context, tenantId, isPrimaryRealTenant, rolesByName,
            positionCode: "POS-OF1-CHIEF",
            positionTitle: "Division Chief, Office 1",
            functionalTitle: "Head of Office 1",
            officeId: office1.Id,
            positionTypeId: mgrPositionType.Id,
            plantillaTypeId: permPlantilla.Id,
            salaryGradeId: defaultSg.Id,
            stepId: defaultStep.Id,
            employeeNumber: "EMP-OF1-001",
            username: "veronica.lim",
            email: "veronica.lim@erpez.gov.ph",
            firstName: "DR. VERONICA",
            middleName: "S.",
            lastName: "LIM",
            amsRoleNames: ["Planning Officer", "Executive Approver"]);

        await EnsureSignatoryPositionAndPersonnelAsync(
            context, tenantId, isPrimaryRealTenant, rolesByName,
            positionCode: "POS-OF1-PLAN",
            positionTitle: "Planning Officer II, Office 1",
            functionalTitle: "Office 1 Planning & Budget Coordinator",
            officeId: office1.Id,
            positionTypeId: techPositionType.Id,
            plantillaTypeId: permPlantilla.Id,
            salaryGradeId: sg18.Id,
            stepId: defaultStep.Id,
            employeeNumber: "EMP-OF1-002",
            username: "daniel.tan",
            email: "daniel.tan@erpez.gov.ph",
            firstName: "MR. DANIEL",
            middleName: "K.",
            lastName: "TAN",
            amsRoleNames: ["Planning Officer", "Procurement Officer"]);

        // ── Dynamic Catch-All: Ensure ANY other Office in the tenant has a Division Chief & staffed positions ──
        var allOffices = await context.Offices!.ToListAsync();
        var officeHeadsByOfficeId = new Dictionary<Guid, (Position Position, User User)>
        {
            [mainOffice.Id] = hopePosition,
            [ovppfOffice.Id] = recommendingPosition,
            [fmsOffice.Id] = financePosition,
            [spmoOffice.Id] = supplyPosition,
            [bacOffice.Id] = bacChairPosition,
            [ictdOffice.Id] = ictdChief,
            [itsdOffice.Id] = itsdChief,
            [office1.Id] = office1Chief
        };

        foreach (var office in allOffices)
        {
            var officePositions = await context.Positions!
                .Where(p => p.OfficeId == office.Id && !p.IsDeleted)
                .ToListAsync();

            if (officePositions.Count == 0)
            {
                var cleanCode = office.Code.Replace(" ", "-").ToUpperInvariant();
                var headPair = await EnsureSignatoryPositionAndPersonnelAsync(
                    context, tenantId, isPrimaryRealTenant, rolesByName,
                    positionCode: $"POS-{cleanCode}-HEAD",
                    positionTitle: $"Division Chief, {office.Name}",
                    functionalTitle: $"Head, {office.Name}",
                    officeId: office.Id,
                    positionTypeId: mgrPositionType.Id,
                    plantillaTypeId: permPlantilla.Id,
                    salaryGradeId: defaultSg.Id,
                    stepId: defaultStep.Id,
                    employeeNumber: $"EMP-{cleanCode}-001",
                    username: $"{cleanCode.ToLowerInvariant()}.head",
                    email: $"{cleanCode.ToLowerInvariant()}.head@erpez.gov.ph",
                    firstName: "ENGR. MARCUS",
                    middleName: "V.",
                    lastName: "SALVADOR",
                    amsRoleNames: ["Planning Officer", "Procurement Officer", "Executive Approver"]);
                officeHeadsByOfficeId[office.Id] = headPair;
            }
            else if (!officeHeadsByOfficeId.ContainsKey(office.Id))
            {
                var headPos = officePositions
                    .OrderByDescending(p =>
                        p.Title.Contains("Chief", StringComparison.OrdinalIgnoreCase) ||
                        p.Title.Contains("Director", StringComparison.OrdinalIgnoreCase) ||
                        p.Title.Contains("Head", StringComparison.OrdinalIgnoreCase))
                    .First();

                var activePp = await context.PersonnelPositions!
                    .Include(pp => pp.User)
                    .FirstOrDefaultAsync(pp => pp.PositionId == headPos.Id && pp.IsActive);

                if (activePp?.User != null)
                {
                    officeHeadsByOfficeId[office.Id] = (headPos, activePp.User);
                }
            }
        }

        // ── Ensure logged-in interactive users have OfficeId + full AMS roles for testing ──
        if (isPrimaryRealTenant)
        {
            var interactiveUsers = await context.Users!
                .Where(u => u.Email.Contains("maureal") || u.Username.Contains("maureal"))
                .ToListAsync();

            foreach (var iUser in interactiveUsers)
            {
                if (!iUser.OfficeId.HasValue || iUser.OfficeId == Guid.Empty)
                {
                    iUser.OfficeId = ictdOffice.Id;
                }

                await EnsureUserRoleAssignmentsAsync(
                    context,
                    iUser.Id,
                    rolesByName,
                    ["System Administrator", "Planning Officer", "Budget Officer", "Procurement Officer", "BAC Member", "Executive Approver"]);
            }
            await context.SaveChangesAsync();
        }

        // 7. Seed WorkflowMatrices for ALL FiscalYears and ALL Offices in this tenant
        var allFiscalYears = await context.FiscalYears!.ToListAsync();
        var existingMatrices = await context.WorkflowMatrices!.ToListAsync();
        var newMatrices = new List<WorkflowMatrix>();
        string?[] docTypesToSeed = [null, "OPCR", "PPMP", "WFP", "LIB", "PR", "APR"];

        foreach (var fy in allFiscalYears)
        {
            foreach (var office in allOffices)
            {
                foreach (var docType in docTypesToSeed)
                {
                    bool exists = existingMatrices.Any(wm =>
                        wm.FiscalYearId == fy.Id &&
                        wm.OfficeId == office.Id &&
                        string.Equals(wm.DocumentType ?? string.Empty, docType ?? string.Empty, StringComparison.OrdinalIgnoreCase));

                    if (!exists)
                    {
                        newMatrices.Add(new WorkflowMatrix
                        {
                            Id = Guid.NewGuid(),
                            TenantId = tenantId,
                            FiscalYearId = fy.Id,
                            OfficeId = office.Id,
                            DocumentType = docType,
                            Status = "Active",
                            RecommendingApproverPositionId = recommendingPosition.Position.Id,
                            FinalApproverPositionId = hopePosition.Position.Id
                        });
                    }
                }
            }
        }

        if (newMatrices.Count > 0)
        {
            await context.WorkflowMatrices!.AddRangeAsync(newMatrices);
            await context.SaveChangesAsync();
        }

        // 8. Backfill existing OPCR records' CommitmentPersonName and CommitmentPersonPosition if empty
        if (context.OPCRs != null)
        {
            var opcrsToUpdate = await context.OPCRs
                .Where(o => string.IsNullOrEmpty(o.CommitmentPersonName) || string.IsNullOrEmpty(o.CommitmentPersonPosition))
                .ToListAsync();

            foreach (var opcr in opcrsToUpdate)
            {
                if (officeHeadsByOfficeId.TryGetValue(opcr.OfficeId, out var headInfo))
                {
                    if (string.IsNullOrWhiteSpace(opcr.CommitmentPersonName))
                        opcr.CommitmentPersonName = headInfo.User.FullName.Trim();
                    if (string.IsNullOrWhiteSpace(opcr.CommitmentPersonPosition))
                        opcr.CommitmentPersonPosition = headInfo.Position.Title.Trim();
                }
            }

            if (opcrsToUpdate.Count > 0)
            {
                await context.SaveChangesAsync();
            }
        }

        // 9. Seed Performance Management Team (PMT) and PMTMembers for this tenant if none exist
        if (!await context.PMTs!.AnyAsync())
        {
            var pmt = new PMT
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                OrganizationId = organization.Id,
                ActiveYear = fiscalYear.Year,
                IsManualWorkflow = false,
                IsActive = true
            };
            await context.PMTs!.AddAsync(pmt);
            await context.SaveChangesAsync();

            var pmtMembers = new List<PMTMember>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    PMTId = pmt.Id,
                    UserId = recommendingPosition.User.Id,
                    Role = nameof(PMTRoleEnum.Chair),
                    AppointmentDate = new DateTime(fiscalYear.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    IsActive = true
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    PMTId = pmt.Id,
                    UserId = financePosition.User.Id,
                    Role = nameof(PMTRoleEnum.ViceChair),
                    AppointmentDate = new DateTime(fiscalYear.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    IsActive = true
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    PMTId = pmt.Id,
                    UserId = bacChairPosition.User.Id,
                    Role = nameof(PMTRoleEnum.Member),
                    AppointmentDate = new DateTime(fiscalYear.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    IsActive = true
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    PMTId = pmt.Id,
                    UserId = supplyPosition.User.Id,
                    Role = nameof(PMTRoleEnum.Member),
                    AppointmentDate = new DateTime(fiscalYear.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    IsActive = true
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    PMTId = pmt.Id,
                    UserId = bacSecPosition.User.Id,
                    Role = nameof(PMTRoleEnum.Secretariat),
                    AppointmentDate = new DateTime(fiscalYear.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    IsActive = true
                }
            };

            await context.PMTMembers!.AddRangeAsync(pmtMembers);
            await context.SaveChangesAsync();
        }
    }

    private static async Task<Office> EnsureOfficeAsync(
        ApplicationDbContext context,
        Guid tenantId,
        string name,
        string code,
        Guid organizationId,
        Guid officeTypeId,
        Guid categoryId,
        Guid adminLevelId,
        Guid? parentId = null)
    {
        var existing = await context.Offices!.FirstOrDefaultAsync(o => o.Code == code);
        if (existing != null)
        {
            return existing;
        }

        var office = new Office
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            Name = name,
            Code = code,
            Address = "Main Campus Administration Building",
            Description = name,
            ResponsibilityCenterCode = $"RC-{code}",
            BudgetCostCenter = $"BCC-{code}",
            OrganizationId = organizationId,
            OfficeTypeId = officeTypeId,
            CategoryId = categoryId,
            AdministrativeLevelId = adminLevelId,
            ParentId = parentId
        };

        await context.Offices!.AddAsync(office);
        await context.SaveChangesAsync();
        return office;
    }

    private static async Task<(Position Position, User User)> EnsureSignatoryPositionAndPersonnelAsync(
        ApplicationDbContext context,
        Guid tenantId,
        bool isPrimaryRealTenant,
        Dictionary<string, Guid> rolesByName,
        string positionCode,
        string positionTitle,
        string functionalTitle,
        Guid officeId,
        Guid positionTypeId,
        Guid plantillaTypeId,
        Guid salaryGradeId,
        Guid stepId,
        string employeeNumber,
        string username,
        string email,
        string firstName,
        string middleName,
        string lastName,
        string[]? amsRoleNames = null)
    {
        var position = await context.Positions!.FirstOrDefaultAsync(p => p.Code == positionCode || p.Title == positionTitle);
        if (position == null)
        {
            position = new Position
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Code = positionCode,
                Title = positionTitle,
                FunctionalTitle = functionalTitle,
                ItemNumber = $"ITEM-{positionCode}",
                OperationalStatus = nameof(PositionStatusEnum.Filled),
                OfficeId = officeId,
                PositionTypeId = positionTypeId,
                PlantillaTypeId = plantillaTypeId,
                SalaryGradeId = salaryGradeId,
                StepId = stepId
            };
            await context.Positions!.AddAsync(position);
            await context.SaveChangesAsync();
        }
        else if (position.OperationalStatus != nameof(PositionStatusEnum.Filled))
        {
            position.OperationalStatus = nameof(PositionStatusEnum.Filled);
            if (string.IsNullOrWhiteSpace(position.FunctionalTitle))
                position.FunctionalTitle = functionalTitle;
            await context.SaveChangesAsync();
        }

        var user = await context.Users!.FirstOrDefaultAsync(
            u => u.EmployeeNumber == employeeNumber || u.Username == username || u.Email == email);
        if (user == null)
        {
            user = new User
            {
                Id = Guid.NewGuid(),
                ExternalIdentityId = $"seed-{employeeNumber.ToLowerInvariant()}",
                EmployeeNumber = employeeNumber,
                Username = username,
                Email = email,
                FirstName = firstName,
                MiddleName = middleName,
                LastName = lastName,
                EmploymentStatus = nameof(EmploymentStatusEnum.Regular),
                DateHired = new DateTime(2020, 1, 15, 0, 0, 0, DateTimeKind.Utc),
                IsActive = true,
                OfficeId = officeId
            };
            await context.Users!.AddAsync(user);
            await context.SaveChangesAsync();
        }
        else if (isPrimaryRealTenant || !user.OfficeId.HasValue || user.OfficeId == Guid.Empty)
        {
            user.OfficeId = officeId;
            user.IsActive = true;
            await context.SaveChangesAsync();
        }

        var assignment = await context.PersonnelPositions!.FirstOrDefaultAsync(
            pp => pp.PositionId == position.Id && pp.IsActive);
        if (assignment == null)
        {
            assignment = new PersonnelPosition
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                PositionId = position.Id,
                UserId = user.Id,
                AssignmentType = nameof(AssignmentTypeEnum.Permanent),
                IsActive = true,
                StartDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            };
            await context.PersonnelPositions!.AddAsync(assignment);
            await context.SaveChangesAsync();
        }

        if (amsRoleNames != null && amsRoleNames.Length > 0)
        {
            await EnsureUserRoleAssignmentsAsync(context, user.Id, rolesByName, amsRoleNames);
        }

        return (position, user);
    }

    private static async Task EnsureUserRoleAssignmentsAsync(
        ApplicationDbContext context,
        Guid userId,
        Dictionary<string, Guid> rolesByName,
        IEnumerable<string> roleNames)
    {
        if (context.UserRoleAssignments == null || rolesByName.Count == 0)
            return;

        var existingAssignments = await context.UserRoleAssignments
            .IgnoreQueryFilters()
            .Where(ura => ura.UserId == userId)
            .ToListAsync();

        var changed = false;
        foreach (var roleName in roleNames)
        {
            if (!rolesByName.TryGetValue(roleName, out var roleId))
                continue;

            var existing = existingAssignments.FirstOrDefault(ura => ura.RoleId == roleId);
            if (existing == null)
            {
                var assignment = new UserRoleAssignment
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    RoleId = roleId,
                    AssignedAt = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "SystemSeed"
                };
                await context.UserRoleAssignments.AddAsync(assignment);
                existingAssignments.Add(assignment);
                changed = true;
            }
            else if (existing.IsDeleted)
            {
                existing.IsDeleted = false;
                existing.DeletedAt = null;
                existing.DeletedBy = null;
                changed = true;
            }
        }

        if (changed)
        {
            await context.SaveChangesAsync();
        }
    }
}

