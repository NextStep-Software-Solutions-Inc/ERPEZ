using System.Data;
using ERPEZ.TenantManagement.Application.Features.Inquiries.Common;
using ERPEZ.TenantManagement.Infrastructure.Persistence;
using ERPEZ.TenantManagement.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Npgsql;
using Xunit;
using Xunit.Abstractions;

namespace ERPEZ.TenantManagement.Application.UnitTests.Features.Inquiries;

public class SqlInquiryStoreIntegrationTests(ITestOutputHelper output) : IAsyncLifetime
{
    private static readonly string connectionString = ResolveConnectionString();
    private static bool? isDbAvailable;

    private static string ResolveConnectionString()
    {
        var env = Environment.GetEnvironmentVariable("TEST_DB_CONNECTION_STRING")
            ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection");

        if (!string.IsNullOrWhiteSpace(env))
        {
            return env;
        }

        try
        {
            var appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            var secretsFolder = Path.Combine(appData, "Microsoft", "UserSecrets");
            if (Directory.Exists(secretsFolder))
            {
                foreach (var dir in Directory.GetDirectories(secretsFolder))
                {
                    var configFile = Path.Combine(dir, "secrets.json");
                    if (File.Exists(configFile))
                    {
                        var json = File.ReadAllText(configFile);
                        using var doc = System.Text.Json.JsonDocument.Parse(json);
                        if (doc.RootElement.TryGetProperty("ConnectionStrings:DefaultConnection", out var prop))
                        {
                            var val = prop.GetString();
                            if (!string.IsNullOrWhiteSpace(val))
                            {
                                return val;
                            }
                        }
                    }
                }
            }
        }
        catch
        {
            // Suppress fallback exceptions
        }

        return string.Empty;
    }

    private async Task<bool> IsDatabaseAvailableAsync()
    {
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            return false;
        }

        if (isDbAvailable.HasValue) return isDbAvailable.Value;

        try
        {
            await using var conn = new NpgsqlConnection(connectionString);
            await conn.OpenAsync();
            isDbAvailable = true;
            return true;
        }
        catch
        {
            isDbAvailable = false;
            return false;
        }
    }

    public Task InitializeAsync() => Task.CompletedTask;

    public async Task DisposeAsync()
    {
        if (!isDbAvailable.GetValueOrDefault(false))
        {
            return;
        }

        try
        {
            await using var conn = new NpgsqlConnection(connectionString);
            await conn.OpenAsync();
            await using var cmd = new NpgsqlCommand(@"
                DELETE FROM public.""Inquiries""
                WHERE (""ReferenceCode"" IS NOT NULL AND (
                    ""ReferenceCode"" LIKE 'DEMO-TEST-%'
                    OR ""ReferenceCode"" LIKE 'QT-TEST-%'
                    OR ""ReferenceCode"" LIKE 'QT-STATUS-%'
                    OR ""ReferenceCode"" LIKE 'QT-FLT-%'
                    OR ""ReferenceCode"" LIKE 'QT-FILTER%'
                    OR ""ReferenceCode"" LIKE 'QT-SPEC-%'
                    OR ""ReferenceCode"" LIKE 'QT-RESTART-%'
                ))
                OR ""Email"" LIKE '%@test-domain.com'
                OR ""Email"" LIKE 'tz_verify_%';", conn);
            await cmd.ExecuteNonQueryAsync();
        }
        catch
        {
            // Teardown safeguard exception suppressed
        }
    }

    private static async Task DeleteInquiryByReferenceAsync(string referenceCode)
    {
        if (!isDbAvailable.GetValueOrDefault(false))
        {
            return;
        }

        try
        {
            await using var conn = new NpgsqlConnection(connectionString);
            await conn.OpenAsync();
            await using var cmd = new NpgsqlCommand("DELETE FROM public.\"Inquiries\" WHERE \"ReferenceCode\" = @ref;", conn);
            cmd.Parameters.AddWithValue("ref", referenceCode);
            await cmd.ExecuteNonQueryAsync();
        }
        catch
        {
            // Teardown safeguard exception suppressed
        }
    }

    private static async Task DeleteInquiryByEmailAsync(string email)
    {
        if (!isDbAvailable.GetValueOrDefault(false))
        {
            return;
        }

        try
        {
            await using var conn = new NpgsqlConnection(connectionString);
            await conn.OpenAsync();
            await using var cmd = new NpgsqlCommand("DELETE FROM public.\"Inquiries\" WHERE LOWER(\"Email\") = LOWER(@email);", conn);
            cmd.Parameters.AddWithValue("email", email);
            await cmd.ExecuteNonQueryAsync();
        }
        catch
        {
            // Teardown safeguard exception suppressed
        }
    }

    private IConfiguration CreateConfiguration()
    {
        var inMemorySettings = new Dictionary<string, string?>
        {
            { "ConnectionStrings:DefaultConnection", connectionString }
        };
        return new ConfigurationBuilder().AddInMemoryCollection(inMemorySettings).Build();
    }

    private async Task<bool> EnsureMigrationAppliedAsync()
    {
        if (!await IsDatabaseAvailableAsync())
        {
            output.WriteLine("PostgreSQL test database not available. Skipping integration test.");
            return false;
        }

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql(connectionString)
            .Options;

        await using var dbContext = new ApplicationDbContext(options);
        await dbContext.Database.MigrateAsync();
        output.WriteLine("Standard EF Core database migrations applied successfully.");
        return true;
    }

    [Fact]
    public async Task Migration_CreatesInquiriesTable_WithProperColumnsAndIndexes()
    {
        if (!await EnsureMigrationAppliedAsync()) return;

        await using var conn = new NpgsqlConnection(connectionString);
        await conn.OpenAsync();

        // 0. Verify Migration is Tracked in __EFMigrationsHistory
        await using var historyCmd = new NpgsqlCommand(
            "SELECT COUNT(*) FROM public.\"__EFMigrationsHistory\" WHERE \"MigrationId\" = '20261009120000_CreateInquiriesTable';", conn);
        var historyCount = Convert.ToInt64(await historyCmd.ExecuteScalarAsync());
        Assert.Equal(1, historyCount);

        // 1. Verify Table Exists
        await using var tableCmd = new NpgsqlCommand(
            "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'Inquiries';", conn);
        var tableCount = Convert.ToInt64(await tableCmd.ExecuteScalarAsync());
        Assert.Equal(1, tableCount);

        // 2. Verify Key Columns Exist
        var expectedColumns = new[]
        {
            "Id", "ReferenceCode", "InquiryType", "ContactName", "Email", "Phone",
            "OrganizationName", "Status", "PlanName", "Tier", "DeploymentType",
            "TeamSize", "RequestedModules", "ScopeSummary", "EstimatedDelivery",
            "PreferredDate", "PreferredTimeSlot", "Notes", "Source", "AssignedTo",
            "SubmittedAtUtc", "UpdatedAtUtc", "IsDeleted"
        };

        foreach (var col in expectedColumns)
        {
            await using var colCmd = new NpgsqlCommand(
                "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'Inquiries' AND column_name = @col;", conn);
            colCmd.Parameters.AddWithValue("col", col);
            var colCount = Convert.ToInt64(await colCmd.ExecuteScalarAsync());
            Assert.True(colCount > 0, $"Expected column '{col}' does not exist in public.\"Inquiries\"");
        }

        // 3. Verify Indexes Exist
        var expectedIndexes = new[]
        {
            "IX_Inquiries_ReferenceCode",
            "IX_Inquiries_Subscriber_Email",
            "IX_Inquiries_Type_SubmittedAt",
            "IX_Inquiries_Status_SubmittedAt"
        };

        foreach (var idx in expectedIndexes)
        {
            await using var idxCmd = new NpgsqlCommand(
                "SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public' AND tablename = 'Inquiries' AND indexname = @idx;", conn);
            idxCmd.Parameters.AddWithValue("idx", idx);
            var idxCount = Convert.ToInt64(await idxCmd.ExecuteScalarAsync());
            Assert.True(idxCount > 0, $"Expected index '{idx}' does not exist on public.\"Inquiries\"");
        }

        output.WriteLine("Schema verification passed: table, columns, and indexes are intact.");
    }

    [Fact]
    public async Task SqlInquiryStore_PersistsAndRetrieves_QuoteInquiry()
    {
        if (!await EnsureMigrationAppliedAsync()) return;

        var config = CreateConfiguration();
        var store = new SqlInquiryStore(config, NullLogger<SqlInquiryStore>.Instance);

        var testRef = $"QT-TEST-{Guid.NewGuid():N}"[..20].ToUpperInvariant();
        try
        {
            var quoteDto = new QuoteInquiryDto
            {
                ReferenceCode = testRef,
                ContactName = "Engr. Juan Dela Cruz",
                Email = "juan.delacruz@gov.ph",
                Phone = "+63 917 555 9999",
                OrganizationName = "National Economic Authority",
                TeamSize = "50-100 users",
                PlanName = "Enterprise Suite",
                Tier = "Enterprise",
                DeploymentType = "Cloud SaaS (Datacenter)",
                RequestedModules = ["ams", "pbms", "pms", "bms"],
                ScopeSummary = "Enterprise Suite with full procurement and asset workflows",
                EstimatedDelivery = "Immediate workspace provisioning available upon confirmation",
                Status = "Pending Review",
                SubmittedAtUtc = DateTime.UtcNow
            };

            await store.AddQuoteAsync(quoteDto);

            var quotes = await store.GetQuotesAsync();
            var persisted = quotes.FirstOrDefault(q => q.ReferenceCode == testRef);

            Assert.NotNull(persisted);
            Assert.Equal("Engr. Juan Dela Cruz", persisted.ContactName);
            Assert.Equal("juan.delacruz@gov.ph", persisted.Email);
            Assert.Equal("+63 917 555 9999", persisted.Phone);
            Assert.Equal("National Economic Authority", persisted.OrganizationName);
            Assert.Equal("Enterprise Suite", persisted.PlanName);
            Assert.Equal(4, persisted.RequestedModules.Count);
            Assert.Contains("bms", persisted.RequestedModules);

            output.WriteLine($"Quote persistence verified for ReferenceCode={testRef}");
        }
        finally
        {
            await DeleteInquiryByReferenceAsync(testRef);
        }
    }

    [Fact]
    public async Task SqlInquiryStore_PersistsAndRetrieves_DemoInquiry()
    {
        if (!await EnsureMigrationAppliedAsync()) return;

        var config = CreateConfiguration();
        var store = new SqlInquiryStore(config, NullLogger<SqlInquiryStore>.Instance);

        var testRef = $"DEMO-TEST-{Guid.NewGuid():N}"[..20].ToUpperInvariant();
        try
        {
            var demoDto = new DemoInquiryDto
            {
                ReferenceCode = testRef,
                ContactName = "Atty. Maria Clara",
                Email = "maria.clara@customs.gov.ph",
                Phone = "+63 922 123 4567",
                OrganizationName = "Bureau of Customs Central",
                PreferredDate = "2026-11-05",
                PreferredTimeSlot = "Afternoon (1:00 PM - 5:00 PM)",
                Notes = "Custom demonstration of multi-currency bidding and supplier qualification.",
                Status = "Confirmed",
                SubmittedAtUtc = DateTime.UtcNow
            };

            await store.AddDemoAsync(demoDto);

            var demos = await store.GetDemosAsync();
            var persisted = demos.FirstOrDefault(d => d.ReferenceCode == testRef);

            Assert.NotNull(persisted);
            Assert.Equal("Atty. Maria Clara", persisted.ContactName);
            Assert.Equal("maria.clara@customs.gov.ph", persisted.Email);
            Assert.Equal("2026-11-05", persisted.PreferredDate);
            Assert.Equal("Confirmed", persisted.Status);

            output.WriteLine($"Demo persistence verified for ReferenceCode={testRef}");
        }
        finally
        {
            await DeleteInquiryByReferenceAsync(testRef);
        }
    }

    [Fact]
    public async Task SqlInquiryStore_HandlesSubscriberDeduplication_AndIdempotentUpdate()
    {
        if (!await EnsureMigrationAppliedAsync()) return;

        var config = CreateConfiguration();
        var store = new SqlInquiryStore(config, NullLogger<SqlInquiryStore>.Instance);

        var testEmail = $"subscriber_{Guid.NewGuid():N}@test-domain.com";
        try
        {
            // First subscription
            await store.AddSubscriberAsync(new SubscriberInquiryDto
            {
                Email = testEmail,
                Source = "Pricing Page Modal",
                Status = "Active",
                SubscribedAtUtc = DateTime.UtcNow
            });

            // Second subscription with same email (case insensitive) but different source
            await store.AddSubscriberAsync(new SubscriberInquiryDto
            {
                Email = testEmail.ToUpperInvariant(),
                Source = "Landing Page Footer",
                Status = "Active",
                SubscribedAtUtc = DateTime.UtcNow
            });

            var subscribers = await store.GetSubscribersAsync();
            var matches = subscribers.Where(s => s.Email.Equals(testEmail, StringComparison.OrdinalIgnoreCase)).ToList();

            Assert.Single(matches);
            Assert.Equal("Landing Page Footer", matches[0].Source);

            output.WriteLine($"Subscriber deduplication verified for Email={testEmail}");
        }
        finally
        {
            await DeleteInquiryByEmailAsync(testEmail);
        }
    }

    [Fact]
    public async Task SqlInquiryStore_UpdatesStatusAndProgression()
    {
        if (!await EnsureMigrationAppliedAsync()) return;

        var config = CreateConfiguration();
        var store = new SqlInquiryStore(config, NullLogger<SqlInquiryStore>.Instance);

        var testRef = $"QT-STATUS-{Guid.NewGuid():N}"[..20].ToUpperInvariant();
        try
        {
            await store.AddQuoteAsync(new QuoteInquiryDto
            {
                ReferenceCode = testRef,
                ContactName = "Pedro Penduko",
                Email = "pedro@test.gov",
                OrganizationName = "National Energy Grid",
                PlanName = "Starter",
                Status = "Pending Review",
                SubmittedAtUtc = DateTime.UtcNow
            });

            var updated = await store.UpdateStatusAsync(
                testRef,
                "Contacted",
                notes: "Spoke with prospective client, scheduling commercial evaluation.",
                assignedTo: "superadmin@erpez.dev");

            Assert.True(updated);

            var quotes = await store.GetQuotesAsync();
            var persisted = quotes.FirstOrDefault(q => q.ReferenceCode == testRef);

            Assert.NotNull(persisted);
            Assert.Equal("Contacted", persisted.Status);

            output.WriteLine($"Status update verified for ReferenceCode={testRef}");
        }
        finally
        {
            await DeleteInquiryByReferenceAsync(testRef);
        }
    }

    [Fact]
    public async Task SqlInquiryStore_FiltersSummaryByStatusAndSearch()
    {
        if (!await EnsureMigrationAppliedAsync()) return;

        var config = CreateConfiguration();
        var store = new SqlInquiryStore(config, NullLogger<SqlInquiryStore>.Instance);

        var uniquePrefix = Guid.NewGuid().ToString("N")[..10];
        var testRef = $"QT-FLT-{uniquePrefix}".ToUpperInvariant();
        try
        {
            await store.AddQuoteAsync(new QuoteInquiryDto
            {
                ReferenceCode = testRef,
                ContactName = $"Special Contact {uniquePrefix}",
                Email = $"{uniquePrefix}@agri.gov.ph",
                OrganizationName = "Department of Agriculture Regional Office",
                PlanName = "Professional",
                Status = "SpecialStatus",
                SubmittedAtUtc = DateTime.UtcNow
            });

            // Query with search filter
            var filteredSummary = await store.GetSummaryAsync(
                inquiryType: "quote",
                status: "SpecialStatus",
                search: uniquePrefix);

            Assert.Single(filteredSummary.Quotes);
            Assert.Equal(testRef, filteredSummary.Quotes[0].ReferenceCode);
            Assert.Empty(filteredSummary.Demos);
            Assert.Empty(filteredSummary.Subscribers);

            output.WriteLine($"Filter verification passed for prefix={uniquePrefix}");
        }
        finally
        {
            await DeleteInquiryByReferenceAsync(testRef);
        }
    }

    [Fact]
    public async Task SqlInquiryStore_HandlesSpecialCharacters_AndInternationalNumbers()
    {
        if (!await EnsureMigrationAppliedAsync()) return;

        var config = CreateConfiguration();
        var store = new SqlInquiryStore(config, NullLogger<SqlInquiryStore>.Instance);

        var testRef = $"QT-SPEC-{Guid.NewGuid():N}"[..20].ToUpperInvariant();
        var specialName = "Señor José Peña-Ramos & O'Connor 🇵🇭";
        var intlPhone = "+63 (02) 8987-6543 ext. 204";
        var longSummary = new string('A', 500);

        try
        {
            await store.AddQuoteAsync(new QuoteInquiryDto
            {
                ReferenceCode = testRef,
                ContactName = specialName,
                Email = "jose.ramos@special.ph",
                Phone = intlPhone,
                OrganizationName = "City of Parañaque",
                PlanName = "Professional",
                ScopeSummary = longSummary,
                Status = "Pending Review",
                SubmittedAtUtc = DateTime.UtcNow
            });

            var quotes = await store.GetQuotesAsync();
            var persisted = quotes.FirstOrDefault(q => q.ReferenceCode == testRef);

            Assert.NotNull(persisted);
            Assert.Equal(specialName, persisted.ContactName);
            Assert.Equal(intlPhone, persisted.Phone);
            Assert.Equal(longSummary, persisted.ScopeSummary);

            output.WriteLine($"Special characters and international numbers verified.");
        }
        finally
        {
            await DeleteInquiryByReferenceAsync(testRef);
        }
    }

    [Fact]
    public async Task SqlInquiryStore_SurvivesProcessRestart_AndScopeDestruction()
    {
        if (!await EnsureMigrationAppliedAsync()) return;

        var testRef = $"QT-RESTART-{Guid.NewGuid():N}"[..20].ToUpperInvariant();
        try
        {
            // 1. First scope / process: Write quote inquiry
            {
                var config1 = CreateConfiguration();
                var store1 = new SqlInquiryStore(config1, NullLogger<SqlInquiryStore>.Instance);
                await store1.AddQuoteAsync(new QuoteInquiryDto
                {
                    ReferenceCode = testRef,
                    ContactName = "Undersecretary Antonio Santos",
                    Email = "a.santos@restarted-process.gov.ph",
                    Phone = "+63 917 111 2222",
                    OrganizationName = "Department of Science and Technology",
                    PlanName = "Enterprise Custom",
                    Status = "Submitted",
                    SubmittedAtUtc = DateTime.UtcNow
                });
                // store1 and config1 disposed / discarded
            }

            // 2. Completely new independent scope / process simulated after shutdown
            {
                var config2 = CreateConfiguration();
                var store2 = new SqlInquiryStore(config2, NullLogger<SqlInquiryStore>.Instance);
                var quotes = await store2.GetQuotesAsync();
                var recoveredQuote = quotes.FirstOrDefault(q => q.ReferenceCode == testRef);

                Assert.NotNull(recoveredQuote);
                Assert.Equal("Undersecretary Antonio Santos", recoveredQuote.ContactName);
                Assert.Equal("Department of Science and Technology", recoveredQuote.OrganizationName);
                Assert.Equal("Submitted", recoveredQuote.Status);

                // Update status in the new process session
                var updateResult = await store2.UpdateStatusAsync(testRef, "Qualified", "Qualified by Sales Director", "sales@erpez.dev");
                Assert.True(updateResult);
            }

            // 3. Third independent scope to verify update persistence across process cycles
            {
                var config3 = CreateConfiguration();
                var store3 = new SqlInquiryStore(config3, NullLogger<SqlInquiryStore>.Instance);
                var quotes = await store3.GetQuotesAsync();
                var finalQuote = quotes.FirstOrDefault(q => q.ReferenceCode == testRef);

                Assert.NotNull(finalQuote);
                Assert.Equal("Qualified", finalQuote.Status);

                output.WriteLine($"Persistence survival across multiple independent scopes verified for {testRef}");
            }
        }
        finally
        {
            await DeleteInquiryByReferenceAsync(testRef);
        }
    }

    [Fact]
    public async Task SqlInquiryStore_HandlesDatabaseFailures_AndThrowsMeaningfulException()
    {
        // Bad connection string simulating unreachable database
        var brokenConfig = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            { "ConnectionStrings:DefaultConnection", "Host=invalid-unreachable-host.local;Port=5432;Database=FakeDb;Timeout=2;" }
        }).Build();

        var store = new SqlInquiryStore(brokenConfig, NullLogger<SqlInquiryStore>.Instance);

        // Assert that persistence failure throws Npgsql.NpgsqlException or SocketException rather than false success
        await Assert.ThrowsAnyAsync<Exception>(async () =>
        {
            await store.AddQuoteAsync(new QuoteInquiryDto
            {
                ReferenceCode = "QT-FAIL-TEST",
                Email = "fail@test.gov",
                PlanName = "Starter",
                SubmittedAtUtc = DateTime.UtcNow
            });
        });

        output.WriteLine("Database connection failure correctly raised an exception without silent success.");
    }

    [Fact]
    public async Task MigrationDefaultTimestamp_UnderNonUtcSessionTimeZone_PreservesAccurateUtcInstant()
    {
        if (!await EnsureMigrationAppliedAsync()) return;

        await using var conn = new NpgsqlConnection(connectionString);
        await conn.OpenAsync();

        // 1. Explicitly set session TimeZone to a non-UTC offset (Asia/Manila is UTC+8)
        await using (var setTzCmd = new NpgsqlCommand("SET TIME ZONE 'Asia/Manila';", conn))
        {
            await setTzCmd.ExecuteNonQueryAsync();
        }

        var testEmail = $"tz_verify_{Guid.NewGuid():N}@test.gov";

        // 2. Insert record relying solely on DEFAULT for SubmittedAtUtc and UpdatedAtUtc
        var insertSql = @"
            INSERT INTO public.""Inquiries"" (
                ""InquiryType"", ""Email"", ""Status"", ""Source"", ""IsDeleted""
            ) VALUES (
                'Subscriber', @email, 'Active', 'TZ Test', FALSE
            ) RETURNING ""Id"", ""SubmittedAtUtc"", ""UpdatedAtUtc"";
        ";

        Guid insertedId;
        DateTimeOffset submittedAt;
        await using (var insertCmd = new NpgsqlCommand(insertSql, conn))
        {
            insertCmd.Parameters.AddWithValue("email", testEmail);
            await using var reader = await insertCmd.ExecuteReaderAsync();
            Assert.True(await reader.ReadAsync());
            insertedId = reader.GetGuid(0);
            submittedAt = reader.GetFieldValue<DateTimeOffset>(1);
        }

        try
        {
            // 3. Verify that the recorded instant in UTC matches current UTC within 10 seconds,
            // proving that the default 'now()' avoids the session-time-zone skew (which would otherwise be 8 hours off).
            var currentUtc = DateTimeOffset.UtcNow;
            var diffSeconds = Math.Abs((currentUtc - submittedAt).TotalSeconds);
            Assert.True(diffSeconds < 10.0, $"SubmittedAtUtc skewed! Difference was {diffSeconds} seconds (expected < 10s). Stored UTC: {submittedAt:u}, Current UTC: {currentUtc:u}");

            output.WriteLine($"Verified DEFAULT now() under Asia/Manila session: Stored={submittedAt:u}, CurrentUtc={currentUtc:u}, Diff={diffSeconds:F2}s");
        }
        finally
        {
            // Clean up
            await using var cleanupCmd = new NpgsqlCommand("DELETE FROM public.\"Inquiries\" WHERE \"Id\" = @id;", conn);
            cleanupCmd.Parameters.AddWithValue("id", insertedId);
            await cleanupCmd.ExecuteNonQueryAsync();
        }
    }
}
