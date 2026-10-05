using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Security.Cryptography;
using System.Text;

namespace ERPEZ.TenantManagement.Infrastructure.Persistence.Repositories;

/// <summary>
/// Idempotent seeder that provisions the ERPEZ Dev Sandbox tenant and test members for local development.
/// </summary>
public static class DevTenantAndMemberSeeder
{
    public static Guid DevTenantId { get; } = Guid.Parse("00000000-0000-0000-0000-000000000001");
    public static Guid DevTenantSettingId { get; } = Guid.Parse("00000000-0000-0000-0000-000000000002");

    public record DevPersonaDefinition(
        Guid MemberId,
        string UserId,
        string ExternalIdentityId,
        string DisplayName,
        string Email,
        TenantMemberRole LegacyRole,
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
            TenantMemberRole.Admin,
            ["Tenant Administrator"]
        ),
        new(
            Guid.Parse("aaaaaaaa-0000-0000-0000-000000000002"),
            "dev_planner",
            "dev_planner",
            "Planning Officer (Dev)",
            "planner@erpez.dev",
            TenantMemberRole.Member,
            ["Planning Officer"]
        ),
        new(
            Guid.Parse("aaaaaaaa-0000-0000-0000-000000000003"),
            "dev_preparer",
            "dev_preparer",
            "End User / Preparer (Dev)",
            "preparer@erpez.dev",
            TenantMemberRole.Member,
            ["End User"]
        ),
        new(
            Guid.Parse("aaaaaaaa-0000-0000-0000-000000000004"),
            "dev_approver",
            "dev_approver",
            "Approver (Dev)",
            "approver@erpez.dev",
            TenantMemberRole.Member,
            ["LIB Approver", "PPMP Approver", "WFP Approver", "OPCR Approver"]
        ),
        new(
            Guid.Parse("aaaaaaaa-0000-0000-0000-000000000005"),
            "dev_finance",
            "dev_finance",
            "Finance Officer (Dev)",
            "finance@erpez.dev",
            TenantMemberRole.Member,
            ["Finance Officer"]
        ),
        new(
            Guid.Parse("aaaaaaaa-0000-0000-0000-000000000006"),
            "dev_procurement",
            "dev_procurement",
            "Procurement Officer (Dev)",
            "procurement@erpez.dev",
            TenantMemberRole.Member,
            ["Procurement Officer"]
        ),
        new(
            Guid.Parse("aaaaaaaa-0000-0000-0000-000000000007"),
            "dev_admin",
            "dev_admin",
            "Tenant Admin (Dev)",
            "admin@erpez.dev",
            TenantMemberRole.Admin,
            ["Tenant Administrator"]
        ),
        new(
            Guid.Parse("aaaaaaaa-0000-0000-0000-000000000008"),
            "dev_supplier",
            "dev_supplier",
            "Supplier / Vendor (Dev)",
            "supplier@erpez.dev",
            TenantMemberRole.Member,
            ["Supplier"]
        )
    ];

    public static async Task SeedAsync(ApplicationDbContext dbContext, CancellationToken cancellationToken = default)
    {
        // 1. Ensure Dev Tenant exists
        var existingTenant = await dbContext.Tenants!
            .Include(t => t.Modules)
            .FirstOrDefaultAsync(t => t.Id == DevTenantId, cancellationToken);

        if (existingTenant == null)
        {
            existingTenant = new Tenant
            {
                Id = DevTenantId,
                Name = "ERPEZ Dev Sandbox",
                Description = "Dedicated Development & Testing Environment",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "system"
            };

            await dbContext.Tenants!.AddAsync(existingTenant, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        // 2. Ensure Tenant Setting exists
        var existingSetting = await dbContext.TenantSettings!
            .FirstOrDefaultAsync(ts => ts.TenantId == DevTenantId, cancellationToken);

        if (existingSetting == null)
        {
            existingSetting = new TenantSetting
            {
                Id = DevTenantSettingId,
                TenantId = DevTenantId,
                OnPremise = true,
                BaseURL = "http://localhost:5245",
                DbConnectionString = string.Empty,
                BillingContactEmail = "dev@erpez.local",
                AllowedDomain = "localhost",
                MaxAllowedTenants = 10,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "system"
            };

            await dbContext.TenantSettings!.AddAsync(existingSetting, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        else
        {
            if (string.IsNullOrWhiteSpace(existingSetting.AllowedDomain))
            {
                existingSetting.AllowedDomain = "localhost";
            }
            if (existingSetting.MaxAllowedTenants <= 0)
            {
                existingSetting.MaxAllowedTenants = 10;
            }
            if (string.IsNullOrWhiteSpace(existingSetting.BillingAddress))
            {
                existingSetting.BillingAddress = "100 Enterprise Boulevard, Suite 400";
                existingSetting.BillingCity = "San Francisco";
                existingSetting.BillingCountry = "United States";
                existingSetting.BillingPostalCode = "94105";
                existingSetting.TaxId = "US-987654321";
            }
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        // 2b. Ensure Dev Tenant Subscription exists
        var existingSubscription = await dbContext.TenantSubscriptions!
            .FirstOrDefaultAsync(ts => ts.TenantId == DevTenantId, cancellationToken);

        if (existingSubscription == null)
        {
            existingSubscription = new TenantSubscription
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000003"),
                TenantId = DevTenantId,
                Amount = 299.00m,
                Plan = Plan.Enterprise,
                StartDate = DateTime.UtcNow.AddMonths(-1),
                EndDate = DateTime.UtcNow.AddYears(2),
                Status = Status.Active,
                BillingCycle = BillingCycle.Monthly,
                AutoRenew = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "system"
            };

            await dbContext.TenantSubscriptions!.AddAsync(existingSubscription, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        // 2c. Ensure Dev Tenant Sovereign License Key exists
        var existingLicense = await dbContext.LicenseKeys!
            .FirstOrDefaultAsync(lk => lk.TenantId == DevTenantId, cancellationToken);

        if (existingLicense == null)
        {
            var keyString = "EPZ-ENTERPRISE-20281231-DEV9-7A8B";
            var boundEmail = "admin@erpez.dev";
            var allowedDomain = "localhost";
            var expiresAt = DateTime.UtcNow.AddYears(2);
            var salt = "ERPEZ_OFFLINE_LICENSE_INTEGRITY_SALT_2026_SOVEREIGN_KEY!";
            var rawData = $"{keyString}|{boundEmail}|{allowedDomain}|{expiresAt:yyyy-MM-dd}|{salt}";

            using var sha = SHA256.Create();
            var sigBytes = sha.ComputeHash(Encoding.UTF8.GetBytes(rawData));
            var signature = Convert.ToHexString(sigBytes);

            var licenseKey = new LicenseKey
            {
                Id = Guid.Parse("00000000-0000-0000-0000-000000000004"),
                TenantId = DevTenantId,
                TenantSubscriptionId = existingSubscription.Id,
                Key = keyString,
                Prefix = "EPZ",
                BoundEmail = boundEmail,
                Plan = Plan.Enterprise,
                AllowedDomain = allowedDomain,
                MaxTenants = 10,
                MaxUsers = 100,
                IssuedAt = DateTime.UtcNow.AddMonths(-1),
                ExpiresAt = expiresAt,
                Status = LicenseStatus.Active,
                IsAirGapped = true,
                Signature = signature,
                Notes = "Pre-provisioned developer sandbox air-gapped sovereign license",
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "system"
            };

            await dbContext.LicenseKeys!.AddAsync(licenseKey, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        // 2d. Ensure Dev Tenant Payment Methods exist
        if (dbContext.TenantPaymentMethods != null && !await dbContext.TenantPaymentMethods.AnyAsync(pm => pm.TenantId == DevTenantId, cancellationToken))
        {
            var methods = new List<TenantPaymentMethod>
            {
                new()
                {
                    Id = Guid.Parse("bbbbbbbb-0000-0000-0000-000000000001"),
                    TenantId = DevTenantId,
                    Type = PaymentMethodType.CreditCard,
                    Brand = "visa",
                    Last4 = "4242",
                    ExpiryMonth = 12,
                    ExpiryYear = 2028,
                    CardholderName = "Tenant Admin",
                    IsDefault = true,
                    CreatedAt = DateTime.UtcNow.AddMonths(-6),
                    CreatedBy = "system"
                },
                new()
                {
                    Id = Guid.Parse("bbbbbbbb-0000-0000-0000-000000000002"),
                    TenantId = DevTenantId,
                    Type = PaymentMethodType.CreditCard,
                    Brand = "mastercard",
                    Last4 = "8888",
                    ExpiryMonth = 8,
                    ExpiryYear = 2027,
                    CardholderName = "Finance Department",
                    IsDefault = false,
                    CreatedAt = DateTime.UtcNow.AddMonths(-3),
                    CreatedBy = "system"
                }
            };

            await dbContext.TenantPaymentMethods.AddRangeAsync(methods, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        // 2e. Ensure Dev Tenant Invoices exist
        if (dbContext.TenantInvoices != null && !await dbContext.TenantInvoices.AnyAsync(ti => ti.TenantId == DevTenantId, cancellationToken))
        {
            var inv1Id = Guid.Parse("cccccccc-0000-0000-0000-000000000001");
            var inv2Id = Guid.Parse("cccccccc-0000-0000-0000-000000000002");
            var inv3Id = Guid.Parse("cccccccc-0000-0000-0000-000000000003");
            var inv4Id = Guid.Parse("cccccccc-0000-0000-0000-000000000004");

            var invoices = new List<TenantInvoice>
            {
                new()
                {
                    Id = inv3Id,
                    TenantId = DevTenantId,
                    TenantSubscriptionId = existingSubscription?.Id,
                    InvoiceNumber = "INV-2026-003",
                    PlanName = "Enterprise Plan - March 2026",
                    BillingCycle = BillingCycle.Monthly,
                    InvoiceDate = new DateTime(2026, 3, 1, 0, 0, 0, DateTimeKind.Utc),
                    DueDate = new DateTime(2026, 3, 25, 0, 0, 0, DateTimeKind.Utc),
                    SubtotalAmount = 299.00m,
                    TaxRate = 0.12m,
                    TaxAmount = 35.88m,
                    TotalAmount = 334.88m,
                    Currency = "USD",
                    Status = InvoiceStatus.Pending,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "system",
                    Items =
                    [
                        new TenantInvoiceItem
                        {
                            Id = Guid.NewGuid(),
                            TenantInvoiceId = inv3Id,
                            Description = "Enterprise Plan Monthly Cloud Subscription (Full ERP Suite)",
                            Quantity = 1,
                            UnitPrice = 299.00m,
                            TotalPrice = 299.00m,
                            CreatedAt = DateTime.UtcNow,
                            CreatedBy = "system"
                        }
                    ]
                },
                new()
                {
                    Id = inv2Id,
                    TenantId = DevTenantId,
                    TenantSubscriptionId = existingSubscription?.Id,
                    InvoiceNumber = "INV-2026-002",
                    PlanName = "Enterprise Plan - February 2026",
                    BillingCycle = BillingCycle.Monthly,
                    InvoiceDate = new DateTime(2026, 2, 1, 0, 0, 0, DateTimeKind.Utc),
                    DueDate = new DateTime(2026, 2, 15, 0, 0, 0, DateTimeKind.Utc),
                    PaidDate = new DateTime(2026, 2, 14, 0, 0, 0, DateTimeKind.Utc),
                    SubtotalAmount = 299.00m,
                    TaxRate = 0.12m,
                    TaxAmount = 35.88m,
                    TotalAmount = 334.88m,
                    Currency = "USD",
                    Status = InvoiceStatus.Paid,
                    PaymentMethodSummary = "Visa ending in 4242",
                    CreatedAt = DateTime.UtcNow.AddMonths(-1),
                    CreatedBy = "system",
                    Items =
                    [
                        new TenantInvoiceItem
                        {
                            Id = Guid.NewGuid(),
                            TenantInvoiceId = inv2Id,
                            Description = "Enterprise Plan Monthly Cloud Subscription (Full ERP Suite)",
                            Quantity = 1,
                            UnitPrice = 299.00m,
                            TotalPrice = 299.00m,
                            CreatedAt = DateTime.UtcNow.AddMonths(-1),
                            CreatedBy = "system"
                        }
                    ]
                },
                new()
                {
                    Id = inv1Id,
                    TenantId = DevTenantId,
                    TenantSubscriptionId = existingSubscription?.Id,
                    InvoiceNumber = "INV-2026-001",
                    PlanName = "Enterprise Plan - January 2026",
                    BillingCycle = BillingCycle.Monthly,
                    InvoiceDate = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                    DueDate = new DateTime(2026, 1, 15, 0, 0, 0, DateTimeKind.Utc),
                    PaidDate = new DateTime(2026, 1, 12, 0, 0, 0, DateTimeKind.Utc),
                    SubtotalAmount = 299.00m,
                    TaxRate = 0.12m,
                    TaxAmount = 35.88m,
                    TotalAmount = 334.88m,
                    Currency = "USD",
                    Status = InvoiceStatus.Paid,
                    PaymentMethodSummary = "Visa ending in 4242",
                    CreatedAt = DateTime.UtcNow.AddMonths(-2),
                    CreatedBy = "system",
                    Items =
                    [
                        new TenantInvoiceItem
                        {
                            Id = Guid.NewGuid(),
                            TenantInvoiceId = inv1Id,
                            Description = "Enterprise Plan Monthly Cloud Subscription (Full ERP Suite)",
                            Quantity = 1,
                            UnitPrice = 299.00m,
                            TotalPrice = 299.00m,
                            CreatedAt = DateTime.UtcNow.AddMonths(-2),
                            CreatedBy = "system"
                        }
                    ]
                },
                new()
                {
                    Id = inv4Id,
                    TenantId = DevTenantId,
                    TenantSubscriptionId = existingSubscription?.Id,
                    InvoiceNumber = "INV-2025-012",
                    PlanName = "Professional Plan - December 2025",
                    BillingCycle = BillingCycle.Monthly,
                    InvoiceDate = new DateTime(2025, 12, 1, 0, 0, 0, DateTimeKind.Utc),
                    DueDate = new DateTime(2025, 12, 15, 0, 0, 0, DateTimeKind.Utc),
                    PaidDate = new DateTime(2025, 12, 10, 0, 0, 0, DateTimeKind.Utc),
                    SubtotalAmount = 99.00m,
                    TaxRate = 0.12m,
                    TaxAmount = 11.88m,
                    TotalAmount = 110.88m,
                    Currency = "USD",
                    Status = InvoiceStatus.Paid,
                    PaymentMethodSummary = "Mastercard ending in 8888",
                    CreatedAt = DateTime.UtcNow.AddMonths(-3),
                    CreatedBy = "system",
                    Items =
                    [
                        new TenantInvoiceItem
                        {
                            Id = Guid.NewGuid(),
                            TenantInvoiceId = inv4Id,
                            Description = "Professional Plan Monthly Subscription (Growth Tier)",
                            Quantity = 1,
                            UnitPrice = 99.00m,
                            TotalPrice = 99.00m,
                            CreatedAt = DateTime.UtcNow.AddMonths(-3),
                            CreatedBy = "system"
                        }
                    ]
                }
            };

            await dbContext.TenantInvoices.AddRangeAsync(invoices, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        // 3. Link Available Modules
        if (dbContext.Modules != null && existingTenant.Modules.Count == 0)
        {
            var modules = await dbContext.Modules.ToListAsync(cancellationToken);
            if (modules.Count != 0)
            {
                foreach (var module in modules)
                {
                    existingTenant.Modules.Add(module);
                }
                await dbContext.SaveChangesAsync(cancellationToken);
            }
        }

        // 3c. Ensure all existing registered tenants have at least one active default subscription
        if (dbContext.Tenants != null && dbContext.TenantSubscriptions != null)
        {
            var tenantsWithoutSub = await dbContext.Tenants
                .Include(t => t.TenantSubscriptions)
                .Where(t => !t.TenantSubscriptions.Any())
                .ToListAsync(cancellationToken);

            foreach (var t in tenantsWithoutSub)
            {
                var newSub = new TenantSubscription
                {
                    Id = Guid.NewGuid(),
                    TenantId = t.Id,
                    Plan = Plan.Starter,
                    Status = Status.Active,
                    Amount = 0m,
                    StartDate = t.CreatedAt == default ? DateTime.UtcNow : t.CreatedAt,
                    EndDate = (t.CreatedAt == default ? DateTime.UtcNow : t.CreatedAt).AddYears(1),
                    BillingCycle = BillingCycle.Monthly,
                    AutoRenew = true,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "system"
                };
                await dbContext.TenantSubscriptions.AddAsync(newSub, cancellationToken);
            }

            if (tenantsWithoutSub.Count > 0)
            {
                await dbContext.SaveChangesAsync(cancellationToken);
            }
        }

        // 4. Fetch System Roles for mapping
        var roles = await dbContext.Roles!
            .ToListAsync(cancellationToken);

        var rolesByName = roles.ToDictionary(r => r.NormalizedName, r => r, StringComparer.OrdinalIgnoreCase);

        // 5. Seed Dev Personas / Members
        foreach (var persona in DevPersonas)
        {
            var member = await dbContext.TenantMembers!
                .Include(tm => tm.RoleAssignments)
                .FirstOrDefaultAsync(tm => tm.TenantId == DevTenantId &&
                                          (tm.Id == persona.MemberId || tm.UserId == persona.UserId || tm.ExternalIdentityId == persona.ExternalIdentityId),
                                     cancellationToken);

            var nameParts = persona.DisplayName.Split(' ', 2);
            var firstName = nameParts[0];
            var lastName = nameParts.Length > 1 ? nameParts[1] : string.Empty;

            if (member == null)
            {
                member = new TenantMember
                {
                    Id = persona.MemberId,
                    TenantId = DevTenantId,
                    UserId = persona.UserId,
                    ExternalIdentityId = persona.ExternalIdentityId,
                    Email = persona.Email,
                    FirstName = firstName,
                    LastName = lastName,
                    Status = Status.Active,
#pragma warning disable CS0618
                    Role = persona.LegacyRole,
#pragma warning restore CS0618
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "system"
                };

                await dbContext.TenantMembers!.AddAsync(member, cancellationToken);
                await dbContext.SaveChangesAsync(cancellationToken);
            }
            else
            {
                member.ExternalIdentityId = persona.ExternalIdentityId;
                member.Email = persona.Email;
                member.FirstName = firstName;
                member.LastName = lastName;
                member.Status = Status.Active;
            }

            // Assign roles
            var assignedRoleIds = member.RoleAssignments.Select(ra => ra.RoleId).ToHashSet();

            foreach (var roleName in persona.RoleNames)
            {
                var normalized = roleName.Trim().ToUpperInvariant();
                if (rolesByName.TryGetValue(normalized, out var roleEntity))
                {
                    if (!assignedRoleIds.Contains(roleEntity.Id))
                    {
                        member.RoleAssignments.Add(new TenantMemberRoleAssignment
                        {
                            TenantMemberId = member.Id,
                            RoleId = roleEntity.Id
                        });
                    }
                }
            }
        }

        // 6. Seed Enterprise Subsidiaries (Multi-Database & Multi-Tenant Live Test Data)
        var northConnStr = ResolveSubsidiaryConnectionString(dbContext, "erpez_north_db", "DEV_SUBSIDIARY_NORTH_CONNECTION");
        var southConnStr = ResolveSubsidiaryConnectionString(dbContext, "erpez_south_db", "DEV_SUBSIDIARY_SOUTH_CONNECTION");

        await SeedSubsidiaryAsync(
            dbContext,
            Guid.Parse("00000000-0000-0000-0000-000000000010"),
            Guid.Parse("00000000-0000-0000-0000-000000000020"),
            "North Region Subsidiary Inc.",
            "Enterprise Manufacturing & Regional Branch",
            "admin.north@erpez.dev",
            "north.erpez.dev",
            northConnStr,
            onPremise: false,
            rolesByName,
            [
                new("north_admin", "admin.north@erpez.dev", "North Admin (Dev)", ["Tenant Administrator"]),
                new("north_finance", "finance.north@erpez.dev", "North Finance Officer (Dev)", ["Finance Officer"]),
                new("north_planner", "planner.north@erpez.dev", "North Planning Officer (Dev)", ["Planning Officer"])
            ],
            cancellationToken
        );

        await SeedSubsidiaryAsync(
            dbContext,
            Guid.Parse("00000000-0000-0000-0000-000000000030"),
            Guid.Parse("00000000-0000-0000-0000-000000000040"),
            "South Distribution Corp.",
            "Enterprise Supply Chain & Logistics Hub",
            "admin.south@erpez.dev",
            "south.erpez.dev",
            southConnStr,
            onPremise: true,
            rolesByName,
            [
                new("south_admin", "admin.south@erpez.dev", "South Admin (Dev)", ["Tenant Administrator"]),
                new("south_procurement", "procurement.south@erpez.dev", "South Procurement Officer (Dev)", ["Procurement Officer"])
            ],
            cancellationToken
        );

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static string ResolveSubsidiaryConnectionString(ApplicationDbContext dbContext, string databaseName, string envVarName)
    {
        var customEnv = Environment.GetEnvironmentVariable(envVarName);
        if (!string.IsNullOrWhiteSpace(customEnv))
        {
            return customEnv;
        }

        try
        {
            var baseConn = dbContext.Database.GetConnectionString();
            if (!string.IsNullOrWhiteSpace(baseConn))
            {
                var builder = new NpgsqlConnectionStringBuilder(baseConn)
                {
                    Database = databaseName
                };
                return builder.ConnectionString;
            }
        }
        catch
        {
            // Fallback safely if provider does not support NpgsqlConnectionStringBuilder
        }

        return string.Empty;
    }

    private record SubsidiaryUserSeed(
        string UserId,
        string Email,
        string DisplayName,
        string[] RoleNames
    );

    private static async Task SeedSubsidiaryAsync(
        ApplicationDbContext dbContext,
        Guid tenantId,
        Guid settingId,
        string name,
        string description,
        string adminEmail,
        string domain,
        string dbConnectionString,
        bool onPremise,
        Dictionary<string, Role> rolesByName,
        List<SubsidiaryUserSeed> users,
        CancellationToken cancellationToken)
    {
        var tenant = await dbContext.Tenants!
            .Include(t => t.Modules)
            .FirstOrDefaultAsync(t => t.Id == tenantId, cancellationToken);

        if (tenant == null)
        {
            tenant = new Tenant
            {
                Id = tenantId,
                Name = name,
                Description = description,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "system"
            };
            await dbContext.Tenants!.AddAsync(tenant, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        var setting = await dbContext.TenantSettings!
            .FirstOrDefaultAsync(ts => ts.TenantId == tenantId, cancellationToken);

        if (setting == null)
        {
            setting = new TenantSetting
            {
                Id = settingId,
                TenantId = tenantId,
                OnPremise = onPremise,
                BaseURL = "http://localhost:5245",
                DbConnectionString = dbConnectionString,
                BillingContactEmail = adminEmail,
                AllowedDomain = domain,
                MaxAllowedTenants = 10,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "system"
            };
            await dbContext.TenantSettings!.AddAsync(setting, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        else
        {
            setting.DbConnectionString = dbConnectionString;
            setting.AllowedDomain = domain;
            setting.MaxAllowedTenants = 10;
            setting.BillingContactEmail = adminEmail;
            setting.OnPremise = onPremise;
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        // Subscription
        var sub = await dbContext.TenantSubscriptions!
            .FirstOrDefaultAsync(ts => ts.TenantId == tenantId, cancellationToken);

        if (sub == null)
        {
            sub = new TenantSubscription
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Amount = 299.00m,
                Plan = Plan.Enterprise,
                StartDate = DateTime.UtcNow.AddMonths(-1),
                EndDate = DateTime.UtcNow.AddYears(2),
                Status = Status.Active,
                BillingCycle = BillingCycle.Monthly,
                AutoRenew = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = "system"
            };
            await dbContext.TenantSubscriptions!.AddAsync(sub, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        // Modules
        if (dbContext.Modules != null && tenant.Modules.Count == 0)
        {
            var modules = await dbContext.Modules.ToListAsync(cancellationToken);
            foreach (var mod in modules)
            {
                tenant.Modules.Add(mod);
            }
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        // Members & RBAC
        foreach (var u in users)
        {
            var member = await dbContext.TenantMembers!
                .Include(tm => tm.RoleAssignments)
                .FirstOrDefaultAsync(tm => tm.TenantId == tenantId && (tm.UserId == u.UserId || tm.Email == u.Email), cancellationToken);

            var parts = u.DisplayName.Split(' ', 2);
            var firstName = parts[0];
            var lastName = parts.Length > 1 ? parts[1] : string.Empty;

            if (member == null)
            {
                member = new TenantMember
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    UserId = u.UserId,
                    ExternalIdentityId = u.UserId,
                    Email = u.Email,
                    FirstName = firstName,
                    LastName = lastName,
                    Status = Status.Active,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = "system"
                };
                await dbContext.TenantMembers!.AddAsync(member, cancellationToken);
                await dbContext.SaveChangesAsync(cancellationToken);
            }

            var assignedRoleIds = member.RoleAssignments.Select(ra => ra.RoleId).ToHashSet();
            foreach (var roleName in u.RoleNames)
            {
                var normalized = roleName.Trim().ToUpperInvariant();
                if (rolesByName.TryGetValue(normalized, out var roleEntity))
                {
                    if (!assignedRoleIds.Contains(roleEntity.Id))
                    {
                        member.RoleAssignments.Add(new TenantMemberRoleAssignment
                        {
                            TenantMemberId = member.Id,
                            RoleId = roleEntity.Id
                        });
                    }
                }
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
