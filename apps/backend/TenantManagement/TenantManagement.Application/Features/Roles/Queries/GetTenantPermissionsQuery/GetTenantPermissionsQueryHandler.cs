using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.Roles.Dtos;
using ERPEZ.TenantManagement.Domain.Constants;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Roles.Queries.GetTenantPermissionsQuery;

public class GetTenantPermissionsQueryHandler
    : IRequestHandler<GetTenantPermissionsQuery, ApiResponse<IReadOnlyList<PermissionCategoryDto>>>
{
    private static readonly List<PermissionCategoryDto> cachedCategories =
    [
        new PermissionCategoryDto
        {
            Category = "Workspace",
            Permissions =
            [
                new PermissionDefinitionDto
                {
                    Key = TenantPermissions.workspaceView,
                    DisplayName = "View Workspace",
                    Description = "View general workspace overview, settings, and status.",
                    Category = "Workspace"
                },
                new PermissionDefinitionDto
                {
                    Key = TenantPermissions.workspaceManage,
                    DisplayName = "Manage Workspace",
                    Description = "Update workspace profile, organization name, and configuration.",
                    Category = "Workspace"
                }
            ]
        },
        new PermissionCategoryDto
        {
            Category = "Members & Access",
            Permissions =
            [
                new PermissionDefinitionDto
                {
                    Key = TenantPermissions.membersView,
                    DisplayName = "View Members",
                    Description = "View workspace member directory, invitation states, and assigned roles.",
                    Category = "Members & Access"
                },
                new PermissionDefinitionDto
                {
                    Key = TenantPermissions.membersManage,
                    DisplayName = "Manage Members",
                    Description = "Invite new members, update role assignments, suspend, and remove members.",
                    Category = "Members & Access"
                }
            ]
        },
        new PermissionCategoryDto
        {
            Category = "Roles & Permissions",
            Permissions =
            [
                new PermissionDefinitionDto
                {
                    Key = TenantPermissions.rolesView,
                    DisplayName = "View Roles",
                    Description = "View assignable system roles and custom workspace roles.",
                    Category = "Roles & Permissions"
                },
                new PermissionDefinitionDto
                {
                    Key = TenantPermissions.rolesManage,
                    DisplayName = "Manage Roles",
                    Description = "Create, modify, and delete custom workspace governance roles.",
                    Category = "Roles & Permissions"
                }
            ]
        },
        new PermissionCategoryDto
        {
            Category = "Billing & Payments",
            Permissions =
            [
                new PermissionDefinitionDto
                {
                    Key = TenantPermissions.billingView,
                    DisplayName = "View Billing",
                    Description = "View payment methods, billing profile, and card details.",
                    Category = "Billing & Payments"
                },
                new PermissionDefinitionDto
                {
                    Key = TenantPermissions.billingManage,
                    DisplayName = "Manage Billing",
                    Description = "Add or update payment methods and billing contact details.",
                    Category = "Billing & Payments"
                },
                new PermissionDefinitionDto
                {
                    Key = TenantPermissions.invoicesView,
                    DisplayName = "View Invoices",
                    Description = "Access and download past invoices and receipts.",
                    Category = "Billing & Payments"
                }
            ]
        },
        new PermissionCategoryDto
        {
            Category = "Subscriptions & Plans",
            Permissions =
            [
                new PermissionDefinitionDto
                {
                    Key = TenantPermissions.subscriptionsView,
                    DisplayName = "View Subscriptions",
                    Description = "View current active tier, renewal dates, and seat allocations.",
                    Category = "Subscriptions & Plans"
                },
                new PermissionDefinitionDto
                {
                    Key = TenantPermissions.subscriptionsManage,
                    DisplayName = "Manage Subscriptions",
                    Description = "Upgrade, downgrade, cancel, or modify subscription tiers.",
                    Category = "Subscriptions & Plans"
                }
            ]
        },
        new PermissionCategoryDto
        {
            Category = "Licenses & Sovereignty",
            Permissions =
            [
                new PermissionDefinitionDto
                {
                    Key = TenantPermissions.licensesView,
                    DisplayName = "View Licenses",
                    Description = "View cryptographic air-gapped license details and node bindings.",
                    Category = "Licenses & Sovereignty"
                },
                new PermissionDefinitionDto
                {
                    Key = TenantPermissions.licensesManage,
                    DisplayName = "Manage Licenses",
                    Description = "Upload, activate, or replace offline license packages.",
                    Category = "Licenses & Sovereignty"
                }
            ]
        },
        new PermissionCategoryDto
        {
            Category = "ERP Modules",
            Permissions =
            [
                new PermissionDefinitionDto
                {
                    Key = TenantPermissions.modulesView,
                    DisplayName = "View Modules",
                    Description = "View active and available ERP system modules.",
                    Category = "ERP Modules"
                },
                new PermissionDefinitionDto
                {
                    Key = TenantPermissions.modulesManage,
                    DisplayName = "Manage Modules",
                    Description = "Toggle module activations and feature flag parameters.",
                    Category = "ERP Modules"
                }
            ]
        }
    ];

    public Task<ApiResponse<IReadOnlyList<PermissionCategoryDto>>> Handle(
        GetTenantPermissionsQuery request,
        CancellationToken cancellationToken)
    {
        return Task.FromResult(ApiResponse<IReadOnlyList<PermissionCategoryDto>>.Success(
            cachedCategories,
            "Available tenant permissions retrieved successfully."));
    }
}
