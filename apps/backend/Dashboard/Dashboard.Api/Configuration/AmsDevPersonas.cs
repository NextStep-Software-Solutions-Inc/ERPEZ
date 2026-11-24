namespace ERPEZ.Api.Configuration;

/// <summary>
/// Pre-configured development personas for local RBAC and permission testing in the Dashboard AMS module.
/// </summary>
public static class AmsDevPersonas
{
    public static Guid DevTenantId { get; } = Guid.Parse("00000000-0000-0000-0000-000000000001");

    public record DevPersonaDefinition(
        Guid MemberId,
        string UserId,
        string ExternalIdentityId,
        string DisplayName,
        string Email,
        string[] RoleNames
    );

    public static IReadOnlyList<DevPersonaDefinition> DevPersonas { get; } =
    [
        new(
            Guid.Parse("aaaaaaaa-0000-0000-0000-000000000001"),
            "dev_superadmin",
            "dev_superadmin",
            "Super Administrator (Dev)",
            "superadmin@erpez.dev",
            ["System Administrator"]
        ),
        new(
            Guid.Parse("aaaaaaaa-0000-0000-0000-000000000002"),
            "dev_planner",
            "dev_planner",
            "Planning Officer (Dev)",
            "planner@erpez.dev",
            ["Planning Officer"]
        ),
        new(
            Guid.Parse("aaaaaaaa-0000-0000-0000-000000000003"),
            "dev_preparer",
            "dev_preparer",
            "End User / Preparer (Dev)",
            "preparer@erpez.dev",
            ["Employee / Viewer"]
        ),
        new(
            Guid.Parse("aaaaaaaa-0000-0000-0000-000000000004"),
            "dev_approver",
            "dev_approver",
            "Executive Approver (Dev)",
            "approver@erpez.dev",
            ["Executive Approver"]
        ),
        new(
            Guid.Parse("aaaaaaaa-0000-0000-0000-000000000005"),
            "dev_finance",
            "dev_finance",
            "Budget Officer (Dev)",
            "finance@erpez.dev",
            ["Budget Officer"]
        ),
        new(
            Guid.Parse("aaaaaaaa-0000-0000-0000-000000000006"),
            "dev_procurement",
            "dev_procurement",
            "Procurement Officer (Dev)",
            "procurement@erpez.dev",
            ["Procurement Officer"]
        ),
        new(
            Guid.Parse("aaaaaaaa-0000-0000-0000-000000000007"),
            "dev_admin",
            "dev_admin",
            "System Administrator (Dev)",
            "admin@erpez.dev",
            ["System Administrator"]
        )
    ];
}
