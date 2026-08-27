using ERPEZ.Shared.Constants;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Infrastructure.Persistence.Repositories;

/// <summary>
/// Idempotent seeder that populates default functional system roles and maps atomic permissions.
/// </summary>
public static class RoleSeeder
{
    private record RoleDefinition(string Name, string Description, string[] PermissionKeys);

    private static readonly RoleDefinition[] systemRoles =
    [
        new(
            "End User",
            "Standard department end user capable of drafting and submitting planning and procurement documents.",
            [
                Permissions.Planning.libCreate,
                Permissions.Planning.libUpdate,
                Permissions.Planning.libView,
                Permissions.Planning.libSubmit,
                Permissions.Planning.libAmend,
                Permissions.Planning.wfpCreate,
                Permissions.Planning.wfpUpdate,
                Permissions.Planning.wfpView,
                Permissions.Planning.wfpSubmit,
                Permissions.Planning.opcrCreate,
                Permissions.Planning.opcrUpdate,
                Permissions.Planning.opcrView,
                Permissions.Planning.opcrSubmit,
                Permissions.Procurement.ppmpCreate,
                Permissions.Procurement.ppmpUpdate,
                Permissions.Procurement.ppmpView,
                Permissions.Procurement.ppmpSubmit,
                Permissions.Planning.viewOfficeDashboard
            ]
        ),
        new(
            "Planning Officer",
            "Central planning officer overseeing global dashboards, KPIs, target calibration, and evaluations.",
            [
                Permissions.Planning.kpiCreate,
                Permissions.Planning.kpiView,
                Permissions.Planning.kpiUpdate,
                Permissions.Planning.kpiDelete,
                Permissions.Planning.kpiAssign,
                Permissions.Planning.targetManage,
                Permissions.Planning.ratingScaleManage,
                Permissions.Planning.fiscalYearView,
                Permissions.Planning.fiscalYearManage,
                Permissions.Planning.budgetCallView,
                Permissions.Planning.budgetCallManage,
                Permissions.Planning.workflowMatrixManage,
                Permissions.Planning.economicIndicatorsManage,
                Permissions.Planning.dataMigrationsManage,
                Permissions.Planning.spmsFunctionWeightsManage,
                Permissions.Planning.marketScopingView,
                Permissions.Planning.marketScopingManage,
                Permissions.Planning.marketScopingSubmit,
                Permissions.Planning.marketScopingApprove,
                Permissions.Planning.opcrEvaluate,
                Permissions.Planning.viewGlobalDashboard,
                Permissions.Planning.libView,
                Permissions.Planning.wfpView,
                Permissions.Admin.orgStructureView,
                Permissions.Finance.uacsView,
                Permissions.Procurement.procurementLibraryView,
                Permissions.Procurement.biddingDocumentsView
            ]
        ),
        new(
            "Finance Officer",
            "Finance and budget officer managing agency ceilings, UACS, fund sources, and fiscal locks.",
            [
                Permissions.Finance.agencyMasterBudgetManage,
                Permissions.Finance.budgetCeilingAssign,
                Permissions.Finance.subOfficeCeilingAssign,
                Permissions.Finance.fiscalMonthLockUnlock,
                Permissions.Finance.uacsView,
                Permissions.Finance.uacsManage,
                Permissions.Finance.fundSourceManage,
                Permissions.Planning.economicIndicatorsManage,
                Permissions.Planning.fiscalYearView,
                Permissions.Planning.fiscalYearManage,
                Permissions.Planning.viewGlobalDashboard,
                Permissions.Admin.orgStructureView,
                Permissions.Procurement.procurementLibraryView
            ]
        ),
        new(
            "Procurement Officer",
            "Procurement officer consolidating PPMPs and handling bidding, BAC, RFQ, and purchase orders.",
            [
                Permissions.Procurement.ppmpView,
                Permissions.Procurement.ppmpReview,
                Permissions.Procurement.ppmpConsolidate,
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
                Permissions.Procurement.supplierManage,
                Permissions.Planning.marketScopingView,
                Permissions.Admin.orgStructureView,
                Permissions.Finance.uacsView
            ]
        ),
        new(
            "LIB Approver",
            "Designated reviewer / approver for Line Item Budgets.",
            [
                Permissions.Planning.libApprove,
                Permissions.Planning.libView
            ]
        ),
        new(
            "WFP Approver",
            "Designated reviewer / approver for Work & Financial Plans.",
            [
                Permissions.Planning.wfpApprove,
                Permissions.Planning.wfpView
            ]
        ),
        new(
            "OPCR Approver",
            "Designated reviewer / approver for Office Performance Commitment and Reviews.",
            [
                Permissions.Planning.opcrApprove,
                Permissions.Planning.opcrView
            ]
        ),
        new(
            "PPMP Approver",
            "Designated reviewer / approver for Project Procurement Management Plans.",
            [
                Permissions.Procurement.ppmpApprove,
                Permissions.Procurement.ppmpView
            ]
        ),
        new(
            "Tenant Administrator",
            "Tenant-level administrator managing organization structures, user memberships, and workflow matrices.",
            [
                Permissions.Admin.membersManage,
                Permissions.Admin.rolesManage,
                Permissions.Admin.usersManage,
                Permissions.Admin.orgStructureView,
                Permissions.Admin.orgStructureManage,
                Permissions.Admin.systemAdminView,
                Permissions.Admin.systemAdminManage,
                Permissions.Planning.fiscalYearView,
                Permissions.Planning.fiscalYearManage,
                Permissions.Planning.budgetCallView,
                Permissions.Planning.budgetCallManage,
                Permissions.Planning.workflowMatrixManage,
                Permissions.Planning.economicIndicatorsManage,
                Permissions.Planning.dataMigrationsManage,
                Permissions.Planning.spmsFunctionWeightsManage,
                Permissions.Planning.ratingScaleManage,
                Permissions.Planning.marketScopingView,
                Permissions.Planning.marketScopingManage,
                Permissions.Planning.marketScopingSubmit,
                Permissions.Planning.marketScopingApprove,
                Permissions.Finance.agencyMasterBudgetManage,
                Permissions.Finance.budgetCeilingAssign,
                Permissions.Finance.subOfficeCeilingAssign,
                Permissions.Finance.fiscalMonthLockUnlock,
                Permissions.Finance.uacsView,
                Permissions.Finance.uacsManage,
                Permissions.Finance.fundSourceManage,
                Permissions.Procurement.procurementLibraryView,
                Permissions.Procurement.procurementLibraryManage,
                Permissions.Procurement.procurementThresholdsManage,
                Permissions.Procurement.biddingDocumentsView,
                Permissions.Procurement.biddingDocumentsManage,
                Permissions.Procurement.supplierView,
                Permissions.Procurement.supplierManage,
                Permissions.Planning.viewGlobalDashboard
            ]
        )
    ];

    public static async Task SeedAsync(ApplicationDbContext dbContext, CancellationToken cancellationToken = default)
    {
        var existingPermissions = await dbContext.Permissions!
            .ToDictionaryAsync(p => p.Key, p => p.Id, StringComparer.OrdinalIgnoreCase, cancellationToken);

        var existingRoles = await dbContext.Roles!
            .Include(r => r.RolePermissions)
            .Where(r => r.IsSystemRole && r.TenantId == null)
            .ToListAsync(cancellationToken);

        foreach (var def in systemRoles)
        {
            var normalizedName = def.Name.Trim().ToUpperInvariant();
            var role = existingRoles.FirstOrDefault(r => r.NormalizedName == normalizedName);

            if (role == null)
            {
                role = new Role
                {
                    Name = def.Name,
                    NormalizedName = normalizedName,
                    Description = def.Description,
                    IsSystemRole = true,
                    TenantId = null
                };

                await dbContext.Roles!.AddAsync(role, cancellationToken);
                await dbContext.SaveChangesAsync(cancellationToken);
            }

            // Assign permissions
            var currentAssignedPermissionIds = role.RolePermissions.Select(rp => rp.PermissionId).ToHashSet();

            foreach (var permKey in def.PermissionKeys)
            {
                if (existingPermissions.TryGetValue(permKey, out var permId) && !currentAssignedPermissionIds.Contains(permId))
                {
                    role.RolePermissions.Add(new RolePermission
                    {
                        RoleId = role.Id,
                        PermissionId = permId
                    });
                }
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
