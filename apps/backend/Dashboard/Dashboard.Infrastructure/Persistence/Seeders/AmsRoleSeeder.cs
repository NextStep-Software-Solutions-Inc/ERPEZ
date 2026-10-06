using ERPEZ.Domain.Common;
using ERPEZ.Domain.Entities.AMS;
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

        // Seed default development / on-premise trial license if none exists
        if (context.AmsLicenseSettings != null && !await context.AmsLicenseSettings.AnyAsync())
        {
            await context.AmsLicenseSettings.AddAsync(new AmsLicenseSetting
            {
                Id = Guid.NewGuid(),
                LicenseKey = "EPZ-ENTERPRISE-DEVELOPMENT-LICENSE-KEY",
                Plan = "Enterprise",
                AllowedDomain = "*",
                MaxUsers = 100,
                RemainingDays = 365,
                ExpiresAt = DateTime.UtcNow.AddYears(1),
                LastValidatedAt = DateTime.UtcNow,
                IsValid = true,
                EnabledModules = "ams,sams,pms,pbms",
                ValidationMessage = "Development and Enterprise standalone license active.",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "SystemSeed"
            });
        }

        await context.SaveChangesAsync();
    }
}
