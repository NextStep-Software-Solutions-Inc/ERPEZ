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
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // 1. Seed BAC Members (Chairperson, ViceChairperson, RegularMembers)
        if (context.BACMembers != null && !await context.BACMembers.AnyAsync())
        {
            var bacMembers = new List<BACMember>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    FullName = "ENGR. CARLOS M. REYES, Ph.D.",
                    Position = "BAC Chairperson / VP for Administration",
                    Role = "Chairperson",
                    Order = 1,
                    IsActive = true
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    FullName = "ATTY. ELENA G. SANTOS",
                    Position = "BAC Vice-Chairperson / Legal Officer III",
                    Role = "ViceChairperson",
                    Order = 2,
                    IsActive = true
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    FullName = "DR. ROBERTO L. MENDOZA",
                    Position = "BAC Regular Member / Dean of Engineering",
                    Role = "RegularMember",
                    Order = 3,
                    IsActive = true
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    FullName = "MS. PATRICIA A. CRUZ, CPA",
                    Position = "BAC Regular Member / Chief Administrative Officer",
                    Role = "RegularMember",
                    Order = 4,
                    IsActive = true
                },
                new()
                {
                    Id = Guid.NewGuid(),
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

        // Ensure prerequisite lookup tables from OrganizationStructureSeeder exist
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

        var execPositionType = await context.PositionTypes.FirstOrDefaultAsync(x => x.Code == "EXEC")
            ?? await context.PositionTypes.FirstOrDefaultAsync();
        var mgrPositionType = await context.PositionTypes.FirstOrDefaultAsync(x => x.Code == "MGR")
            ?? execPositionType;
        var supPositionType = await context.PositionTypes.FirstOrDefaultAsync(x => x.Code == "SUP")
            ?? execPositionType;
        var permPlantilla = await context.PlantillaTypes.FirstOrDefaultAsync(x => x.Code == "PERM")
            ?? await context.PlantillaTypes.FirstOrDefaultAsync();
        var defaultSg = await context.SalaryGrades.FirstOrDefaultAsync(x => x.GradeNumber == 24)
            ?? await context.SalaryGrades.FirstOrDefaultAsync();
        var defaultStep = await context.Steps.FirstOrDefaultAsync(x => x.StepNumber == 1)
            ?? await context.Steps.FirstOrDefaultAsync();
        var defaultOfficeType = await context.OfficeTypes.FirstOrDefaultAsync(x => x.Code == "OFF")
            ?? await context.OfficeTypes.FirstOrDefaultAsync();
        var defaultCategory = await context.Categories.FirstOrDefaultAsync(x => x.Code == "ADMIN")
            ?? await context.Categories.FirstOrDefaultAsync();
        var defaultAdminLevel = await context.AdministrativeLevels.FirstOrDefaultAsync(x => x.Code == "NAT")
            ?? await context.AdministrativeLevels.FirstOrDefaultAsync();

        if (execPositionType == null || permPlantilla == null || defaultSg == null ||
            defaultStep == null || defaultOfficeType == null || defaultCategory == null ||
            defaultAdminLevel == null)
        {
            return;
        }

        // 2. Ensure Fiscal Year exists
        var currentYear = DateTime.UtcNow.Year;
        var fiscalYear = await context.FiscalYears.FirstOrDefaultAsync(fy => fy.Year == currentYear)
            ?? await context.FiscalYears.OrderByDescending(fy => fy.Year).FirstOrDefaultAsync();

        if (fiscalYear == null)
        {
            fiscalYear = new FiscalYear
            {
                Id = Guid.NewGuid(),
                Year = currentYear,
                Description = $"Fiscal Year {currentYear}",
                Status = "Active",
                IsLocked = false,
                StartDate = new DateTime(currentYear, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                EndDate = new DateTime(currentYear, 12, 31, 23, 59, 59, DateTimeKind.Utc)
            };
            await context.FiscalYears.AddAsync(fiscalYear);
            await context.SaveChangesAsync();
        }

        // 3. Ensure Organization exists
        var organization = await context.Organizations.FirstOrDefaultAsync();
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
            await context.Organizations.AddAsync(organization);
            await context.SaveChangesAsync();
        }

        // 4. Ensure key Offices exist (Executive/Main, FMS Finance, SPMO Supply, BAC)
        var mainOffice = await EnsureOfficeAsync(
            context, "Office of the President", "OP", organization.Id,
            defaultOfficeType.Id, defaultCategory.Id, defaultAdminLevel.Id);
        var fmsOffice = await EnsureOfficeAsync(
            context, "Financial Management Services", "FMS", organization.Id,
            defaultOfficeType.Id, defaultCategory.Id, defaultAdminLevel.Id);
        var spmoOffice = await EnsureOfficeAsync(
            context, "Supply and Property Management Office", "SPMO", organization.Id,
            defaultOfficeType.Id, defaultCategory.Id, defaultAdminLevel.Id);
        var bacOffice = await EnsureOfficeAsync(
            context, "Bids and Awards Committee Office", "BAC", organization.Id,
            defaultOfficeType.Id, defaultCategory.Id, defaultAdminLevel.Id);

        // 5. Ensure key signatory Positions and active PersonnelPositions exist
        var hopePosition = await EnsureSignatoryPositionAndPersonnelAsync(
            context,
            positionCode: "POS-HOPE-01",
            positionTitle: "Head of the Procuring Entity",
            functionalTitle: "University President / HOPE",
            officeId: mainOffice.Id,
            positionTypeId: execPositionType.Id,
            plantillaTypeId: permPlantilla.Id,
            salaryGradeId: defaultSg.Id,
            stepId: defaultStep.Id,
            employeeNumber: "EMP-SIGN-001",
            username: "hope.approver",
            email: "hope@erpez.gov.ph",
            firstName: "DR. ALEJANDRO",
            middleName: "V.",
            lastName: "DELA CRUZ");

        var recommendingPosition = await EnsureSignatoryPositionAndPersonnelAsync(
            context,
            positionCode: "POS-REC-01",
            positionTitle: "Campus Chancellor",
            functionalTitle: "Vice President for Planning & Finance",
            officeId: mainOffice.Id,
            positionTypeId: mgrPositionType!.Id,
            plantillaTypeId: permPlantilla.Id,
            salaryGradeId: defaultSg.Id,
            stepId: defaultStep.Id,
            employeeNumber: "EMP-SIGN-002",
            username: "recommending.approver",
            email: "chancellor@erpez.gov.ph",
            firstName: "DR. MARIA",
            middleName: "L.",
            lastName: "FERNANDEZ");

        var financePosition = await EnsureSignatoryPositionAndPersonnelAsync(
            context,
            positionCode: "POS-FIN-01",
            positionTitle: "Director of Financial Management Services",
            functionalTitle: "Chief Budget Officer / Accountant",
            officeId: fmsOffice.Id,
            positionTypeId: mgrPositionType.Id,
            plantillaTypeId: permPlantilla.Id,
            salaryGradeId: defaultSg.Id,
            stepId: defaultStep.Id,
            employeeNumber: "EMP-SIGN-003",
            username: "finance.director",
            email: "finance@erpez.gov.ph",
            firstName: "HONORATA",
            middleName: "S.",
            lastName: "BAUTISTA, CPA");

        var supplyPosition = await EnsureSignatoryPositionAndPersonnelAsync(
            context,
            positionCode: "POS-SUP-01",
            positionTitle: "Agency Property/Supply Officer",
            functionalTitle: "Head, Supply and Property Management Office",
            officeId: spmoOffice.Id,
            positionTypeId: supPositionType!.Id,
            plantillaTypeId: permPlantilla.Id,
            salaryGradeId: defaultSg.Id,
            stepId: defaultStep.Id,
            employeeNumber: "EMP-SIGN-004",
            username: "supply.officer",
            email: "supply@erpez.gov.ph",
            firstName: "ERNESTO",
            middleName: "P.",
            lastName: "RAMOS");

        var bacChairPosition = await EnsureSignatoryPositionAndPersonnelAsync(
            context,
            positionCode: "POS-BAC-CHAIR",
            positionTitle: "BAC Chairperson",
            functionalTitle: "Chairperson, Bids and Awards Committee",
            officeId: bacOffice.Id,
            positionTypeId: mgrPositionType.Id,
            plantillaTypeId: permPlantilla.Id,
            salaryGradeId: defaultSg.Id,
            stepId: defaultStep.Id,
            employeeNumber: "EMP-SIGN-005",
            username: "bac.chairperson",
            email: "bac.chair@erpez.gov.ph",
            firstName: "ENGR. CARLOS",
            middleName: "M.",
            lastName: "REYES, Ph.D.");

        var bacSecPosition = await EnsureSignatoryPositionAndPersonnelAsync(
            context,
            positionCode: "POS-BAC-SEC",
            positionTitle: "Head, BAC Secretariat",
            functionalTitle: "Procurement Officer / BAC Secretariat Head",
            officeId: bacOffice.Id,
            positionTypeId: supPositionType.Id,
            plantillaTypeId: permPlantilla.Id,
            salaryGradeId: defaultSg.Id,
            stepId: defaultStep.Id,
            employeeNumber: "EMP-SIGN-006",
            username: "bac.secretariat",
            email: "bac.sec@erpez.gov.ph",
            firstName: "LORENA",
            middleName: "T.",
            lastName: "AQUINO");

        // 6. Seed WorkflowMatrices for all offices in the current fiscal year that don't have one yet
        var allOffices = await context.Offices.ToListAsync();
        var existingMatrices = await context.WorkflowMatrices
            .Where(wm => wm.FiscalYearId == fiscalYear.Id)
            .ToListAsync();

        var newMatrices = new List<WorkflowMatrix>();
        foreach (var office in allOffices)
        {
            bool hasDefaultMatrix = existingMatrices.Any(wm =>
                wm.OfficeId == office.Id && string.IsNullOrEmpty(wm.DocumentType));

            if (!hasDefaultMatrix)
            {
                newMatrices.Add(new WorkflowMatrix
                {
                    Id = Guid.NewGuid(),
                    FiscalYearId = fiscalYear.Id,
                    OfficeId = office.Id,
                    DocumentType = null, // General default for PPMP, LIB, WFP, OPCR, APP, PR, APR, PO, AOB, BAC, etc.
                    Status = "Active",
                    RecommendingApproverPositionId = recommendingPosition.Position.Id,
                    FinalApproverPositionId = hopePosition.Position.Id
                });
            }
        }

        if (newMatrices.Count > 0)
        {
            await context.WorkflowMatrices.AddRangeAsync(newMatrices);
            await context.SaveChangesAsync();
        }

        // 7. Seed Performance Management Team (PMT) and PMTMembers if none exist
        if (!await context.PMTs.AnyAsync())
        {
            var pmt = new PMT
            {
                Id = Guid.NewGuid(),
                OrganizationId = organization.Id,
                ActiveYear = fiscalYear.Year,
                IsManualWorkflow = false,
                IsActive = true
            };
            await context.PMTs.AddAsync(pmt);
            await context.SaveChangesAsync();

            var pmtMembers = new List<PMTMember>
            {
                new()
                {
                    Id = Guid.NewGuid(),
                    PMTId = pmt.Id,
                    UserId = recommendingPosition.User.Id,
                    Role = nameof(PMTRoleEnum.Chair),
                    AppointmentDate = new DateTime(fiscalYear.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    IsActive = true
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    PMTId = pmt.Id,
                    UserId = financePosition.User.Id,
                    Role = nameof(PMTRoleEnum.ViceChair),
                    AppointmentDate = new DateTime(fiscalYear.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    IsActive = true
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    PMTId = pmt.Id,
                    UserId = bacChairPosition.User.Id,
                    Role = nameof(PMTRoleEnum.Member),
                    AppointmentDate = new DateTime(fiscalYear.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    IsActive = true
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    PMTId = pmt.Id,
                    UserId = supplyPosition.User.Id,
                    Role = nameof(PMTRoleEnum.Member),
                    AppointmentDate = new DateTime(fiscalYear.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    IsActive = true
                },
                new()
                {
                    Id = Guid.NewGuid(),
                    PMTId = pmt.Id,
                    UserId = bacSecPosition.User.Id,
                    Role = nameof(PMTRoleEnum.Secretariat),
                    AppointmentDate = new DateTime(fiscalYear.Year, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    IsActive = true
                }
            };

            await context.PMTMembers.AddRangeAsync(pmtMembers);
            await context.SaveChangesAsync();
        }
    }

    private static async Task<Office> EnsureOfficeAsync(
        ApplicationDbContext context,
        string name,
        string code,
        Guid organizationId,
        Guid officeTypeId,
        Guid categoryId,
        Guid adminLevelId)
    {
        var existing = await context.Offices!.FirstOrDefaultAsync(o => o.Code == code);
        if (existing != null)
        {
            return existing;
        }

        var office = new Office
        {
            Id = Guid.NewGuid(),
            Name = name,
            Code = code,
            Address = "Main Campus Administration Building",
            Description = name,
            ResponsibilityCenterCode = $"RC-{code}",
            BudgetCostCenter = $"BCC-{code}",
            OrganizationId = organizationId,
            OfficeTypeId = officeTypeId,
            CategoryId = categoryId,
            AdministrativeLevelId = adminLevelId
        };

        await context.Offices!.AddAsync(office);
        await context.SaveChangesAsync();
        return office;
    }

    private static async Task<(Position Position, User User)> EnsureSignatoryPositionAndPersonnelAsync(
        ApplicationDbContext context,
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
        string lastName)
    {
        var position = await context.Positions!.FirstOrDefaultAsync(p => p.Code == positionCode || p.Title == positionTitle);
        if (position == null)
        {
            position = new Position
            {
                Id = Guid.NewGuid(),
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

        var user = await context.Users!.FirstOrDefaultAsync(u => u.EmployeeNumber == employeeNumber || u.Username == username);
        if (user == null)
        {
            user = new User
            {
                Id = Guid.NewGuid(),
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

        var assignment = await context.PersonnelPositions!.FirstOrDefaultAsync(
            pp => pp.PositionId == position.Id && pp.IsActive);
        if (assignment == null)
        {
            assignment = new PersonnelPosition
            {
                Id = Guid.NewGuid(),
                PositionId = position.Id,
                UserId = user.Id,
                AssignmentType = nameof(AssignmentTypeEnum.Permanent),
                IsActive = true,
                StartDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            };
            await context.PersonnelPositions!.AddAsync(assignment);
            await context.SaveChangesAsync();
        }

        return (position, user);
    }
}

