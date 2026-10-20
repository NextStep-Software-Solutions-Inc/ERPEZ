using System.Data;
using ERPEZ.TenantManagement.Application.Features.Inquiries.Common;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Npgsql;
using NpgsqlTypes;

namespace ERPEZ.TenantManagement.Infrastructure.Persistence.Repositories;

/// <summary>
/// Production database-backed persistence store for prospective customer inquiries,
/// quote requests, product demonstration bookings, and newsletter subscriptions.
/// Uses high-performance parameterized ADO.NET NpgsqlConnection commands directly
/// against the Control Plane database without EF Core migration coupling.
/// </summary>
public class SqlInquiryStore : IInquiryStore
{
    private readonly string connectionString;
    private readonly ILogger<SqlInquiryStore> logger;

    public SqlInquiryStore(IConfiguration configuration, ILogger<SqlInquiryStore> logger)
    {
        this.logger = logger;
        this.connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("DefaultConnection connection string is not configured for SqlInquiryStore.");
    }

    private async Task<NpgsqlConnection> OpenConnectionAsync(CancellationToken cancellationToken)
    {
        var conn = new NpgsqlConnection(connectionString);
        await conn.OpenAsync(cancellationToken);
        return conn;
    }

    public async Task AddQuoteAsync(QuoteInquiryDto quote, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(quote);

        const string sql = """
            INSERT INTO public."Inquiries" (
                "ReferenceCode", "InquiryType", "ContactName", "Email", "Phone",
                "OrganizationName", "TeamSize", "PlanName", "Tier", "DeploymentType",
                "RequestedModules", "ScopeSummary", "EstimatedDelivery", "Status",
                "SubmittedAtUtc", "UpdatedAtUtc", "IsDeleted"
            ) VALUES (
                @refCode, 'Quote', @contactName, @email, @phone,
                @orgName, @teamSize, @planName, @tier, @deploymentType,
                @modules, @scopeSummary, @estimatedDelivery, @status,
                @submittedAt, @updatedAt, FALSE
            );
        """;

        try
        {
            await using var conn = await OpenConnectionAsync(cancellationToken);
            await using var cmd = new NpgsqlCommand(sql, conn);

            var now = quote.SubmittedAtUtc == default ? DateTime.UtcNow : quote.SubmittedAtUtc;
            var modules = quote.RequestedModules?.ToArray() ?? Array.Empty<string>();

            cmd.Parameters.AddWithValue("refCode", string.IsNullOrWhiteSpace(quote.ReferenceCode) ? (object)DBNull.Value : quote.ReferenceCode.Trim());
            cmd.Parameters.AddWithValue("contactName", quote.ContactName?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("email", quote.Email?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("phone", quote.Phone?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("orgName", quote.OrganizationName?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("teamSize", quote.TeamSize?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("planName", quote.PlanName?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("tier", quote.Tier?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("deploymentType", quote.DeploymentType?.Trim() ?? string.Empty);
            cmd.Parameters.Add(new NpgsqlParameter("modules", NpgsqlDbType.Array | NpgsqlDbType.Text) { Value = modules });
            cmd.Parameters.AddWithValue("scopeSummary", quote.ScopeSummary?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("estimatedDelivery", quote.EstimatedDelivery?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("status", string.IsNullOrWhiteSpace(quote.Status) ? "Pending Review" : quote.Status.Trim());
            cmd.Parameters.AddWithValue("submittedAt", now);
            cmd.Parameters.AddWithValue("updatedAt", now);

            await cmd.ExecuteNonQueryAsync(cancellationToken);
            logger.LogInformation("Successfully persisted Quote inquiry: Reference={ReferenceCode}, Email={Email}", quote.ReferenceCode, quote.Email);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to insert Quote inquiry into database: Reference={ReferenceCode}, Email={Email}", quote.ReferenceCode, quote.Email);
            throw;
        }
    }

    public async Task AddDemoAsync(DemoInquiryDto demo, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(demo);

        const string sql = """
            INSERT INTO public."Inquiries" (
                "ReferenceCode", "InquiryType", "ContactName", "Email", "Phone",
                "OrganizationName", "PreferredDate", "PreferredTimeSlot", "Notes",
                "Status", "SubmittedAtUtc", "UpdatedAtUtc", "IsDeleted"
            ) VALUES (
                @refCode, 'Demo', @contactName, @email, @phone,
                @orgName, @prefDate, @prefTime, @notes,
                @status, @submittedAt, @updatedAt, FALSE
            );
        """;

        try
        {
            await using var conn = await OpenConnectionAsync(cancellationToken);
            await using var cmd = new NpgsqlCommand(sql, conn);

            var now = demo.SubmittedAtUtc == default ? DateTime.UtcNow : demo.SubmittedAtUtc;

            cmd.Parameters.AddWithValue("refCode", string.IsNullOrWhiteSpace(demo.ReferenceCode) ? (object)DBNull.Value : demo.ReferenceCode.Trim());
            cmd.Parameters.AddWithValue("contactName", demo.ContactName?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("email", demo.Email?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("phone", demo.Phone?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("orgName", demo.OrganizationName?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("prefDate", demo.PreferredDate?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("prefTime", demo.PreferredTimeSlot?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("notes", demo.Notes?.Trim() ?? string.Empty);
            cmd.Parameters.AddWithValue("status", string.IsNullOrWhiteSpace(demo.Status) ? "Confirmed" : demo.Status.Trim());
            cmd.Parameters.AddWithValue("submittedAt", now);
            cmd.Parameters.AddWithValue("updatedAt", now);

            await cmd.ExecuteNonQueryAsync(cancellationToken);
            logger.LogInformation("Successfully persisted Demo inquiry: Reference={ReferenceCode}, Email={Email}", demo.ReferenceCode, demo.Email);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to insert Demo inquiry into database: Reference={ReferenceCode}, Email={Email}", demo.ReferenceCode, demo.Email);
            throw;
        }
    }

    public async Task AddSubscriberAsync(SubscriberInquiryDto subscriber, CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(subscriber);

        const string sql = """
            INSERT INTO public."Inquiries" (
                "InquiryType", "Email", "Source", "Status",
                "SubmittedAtUtc", "UpdatedAtUtc", "IsDeleted"
            ) VALUES (
                'Subscriber', @email, @source, @status,
                @submittedAt, @updatedAt, FALSE
            )
            ON CONFLICT (LOWER("Email")) WHERE "InquiryType" = 'Subscriber' AND "IsDeleted" = FALSE
            DO UPDATE SET
                "UpdatedAtUtc" = EXCLUDED."UpdatedAtUtc",
                "Status" = EXCLUDED."Status",
                "Source" = EXCLUDED."Source";
        """;

        try
        {
            await using var conn = await OpenConnectionAsync(cancellationToken);
            await using var cmd = new NpgsqlCommand(sql, conn);

            var now = subscriber.SubscribedAtUtc == default ? DateTime.UtcNow : subscriber.SubscribedAtUtc;
            var normalizedEmail = subscriber.Email.Trim().ToLowerInvariant();

            cmd.Parameters.AddWithValue("email", normalizedEmail);
            cmd.Parameters.AddWithValue("source", string.IsNullOrWhiteSpace(subscriber.Source) ? "Landing Page Footer" : subscriber.Source.Trim());
            cmd.Parameters.AddWithValue("status", string.IsNullOrWhiteSpace(subscriber.Status) ? "Active" : subscriber.Status.Trim());
            cmd.Parameters.AddWithValue("submittedAt", now);
            cmd.Parameters.AddWithValue("updatedAt", now);

            await cmd.ExecuteNonQueryAsync(cancellationToken);
            logger.LogInformation("Successfully persisted Subscriber lead: Email={Email}", normalizedEmail);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to insert Subscriber lead into database: Email={Email}", subscriber.Email);
            throw;
        }
    }

    public async Task<IReadOnlyList<QuoteInquiryDto>> GetQuotesAsync(CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT
                "ReferenceCode", "ContactName", "Email", "Phone", "OrganizationName",
                "TeamSize", "PlanName", "Tier", "DeploymentType", "RequestedModules",
                "ScopeSummary", "EstimatedDelivery", "Status", "SubmittedAtUtc"
            FROM public."Inquiries"
            WHERE "InquiryType" = 'Quote' AND "IsDeleted" = FALSE
            ORDER BY "SubmittedAtUtc" DESC;
        """;

        var list = new List<QuoteInquiryDto>();
        await using var conn = await OpenConnectionAsync(cancellationToken);
        await using var cmd = new NpgsqlCommand(sql, conn);
        await using var reader = await cmd.ExecuteReaderAsync(cancellationToken);

        while (await reader.ReadAsync(cancellationToken))
        {
            list.Add(MapQuote(reader));
        }

        return list;
    }

    public async Task<IReadOnlyList<DemoInquiryDto>> GetDemosAsync(CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT
                "ReferenceCode", "ContactName", "Email", "Phone", "OrganizationName",
                "PreferredDate", "PreferredTimeSlot", "Notes", "Status", "SubmittedAtUtc"
            FROM public."Inquiries"
            WHERE "InquiryType" = 'Demo' AND "IsDeleted" = FALSE
            ORDER BY "SubmittedAtUtc" DESC;
        """;

        var list = new List<DemoInquiryDto>();
        await using var conn = await OpenConnectionAsync(cancellationToken);
        await using var cmd = new NpgsqlCommand(sql, conn);
        await using var reader = await cmd.ExecuteReaderAsync(cancellationToken);

        while (await reader.ReadAsync(cancellationToken))
        {
            list.Add(MapDemo(reader));
        }

        return list;
    }

    public async Task<IReadOnlyList<SubscriberInquiryDto>> GetSubscribersAsync(CancellationToken cancellationToken = default)
    {
        const string sql = """
            SELECT
                "Email", "Source", "Status", "SubmittedAtUtc"
            FROM public."Inquiries"
            WHERE "InquiryType" = 'Subscriber' AND "IsDeleted" = FALSE
            ORDER BY "SubmittedAtUtc" DESC;
        """;

        var list = new List<SubscriberInquiryDto>();
        await using var conn = await OpenConnectionAsync(cancellationToken);
        await using var cmd = new NpgsqlCommand(sql, conn);
        await using var reader = await cmd.ExecuteReaderAsync(cancellationToken);

        while (await reader.ReadAsync(cancellationToken))
        {
            list.Add(MapSubscriber(reader));
        }

        return list;
    }

    public async Task<InquiriesSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default)
    {
        return await GetSummaryAsync(null, null, null, cancellationToken);
    }

    public async Task<InquiriesSummaryDto> GetSummaryAsync(
        string? inquiryType = null,
        string? status = null,
        string? search = null,
        CancellationToken cancellationToken = default)
    {
        var summary = new InquiriesSummaryDto();
        var shouldLoadQuotes = string.IsNullOrWhiteSpace(inquiryType) || string.Equals(inquiryType, "quote", StringComparison.OrdinalIgnoreCase);
        var shouldLoadDemos = string.IsNullOrWhiteSpace(inquiryType) || string.Equals(inquiryType, "demo", StringComparison.OrdinalIgnoreCase);
        var shouldLoadSubscribers = string.IsNullOrWhiteSpace(inquiryType) || string.Equals(inquiryType, "subscriber", StringComparison.OrdinalIgnoreCase);

        await using var conn = await OpenConnectionAsync(cancellationToken);

        if (shouldLoadQuotes)
        {
            var quoteSql = BuildFilterSql("Quote", status, search);
            await using var cmd = new NpgsqlCommand(quoteSql, conn);
            BindFilterParameters(cmd, status, search);
            await using var reader = await cmd.ExecuteReaderAsync(cancellationToken);
            while (await reader.ReadAsync(cancellationToken))
            {
                summary.Quotes.Add(MapQuote(reader));
            }
        }

        if (shouldLoadDemos)
        {
            var demoSql = BuildFilterSql("Demo", status, search);
            await using var cmd = new NpgsqlCommand(demoSql, conn);
            BindFilterParameters(cmd, status, search);
            await using var reader = await cmd.ExecuteReaderAsync(cancellationToken);
            while (await reader.ReadAsync(cancellationToken))
            {
                summary.Demos.Add(MapDemo(reader));
            }
        }

        if (shouldLoadSubscribers)
        {
            var subSql = BuildFilterSql("Subscriber", status, search);
            await using var cmd = new NpgsqlCommand(subSql, conn);
            BindFilterParameters(cmd, status, search);
            await using var reader = await cmd.ExecuteReaderAsync(cancellationToken);
            while (await reader.ReadAsync(cancellationToken))
            {
                summary.Subscribers.Add(MapSubscriber(reader));
            }
        }

        return summary;
    }

    public async Task<bool> UpdateStatusAsync(
        string referenceCode,
        string newStatus,
        string? notes = null,
        string? assignedTo = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(referenceCode)) return false;

        const string sql = """
            UPDATE public."Inquiries"
            SET
                "Status" = @status,
                "Notes" = COALESCE(@notes, "Notes"),
                "AssignedTo" = COALESCE(@assignedTo, "AssignedTo"),
                "UpdatedAtUtc" = @updatedAt
            WHERE "ReferenceCode" = @refCode AND "IsDeleted" = FALSE;
        """;

        await using var conn = await OpenConnectionAsync(cancellationToken);
        await using var cmd = new NpgsqlCommand(sql, conn);
        cmd.Parameters.AddWithValue("refCode", referenceCode.Trim());
        cmd.Parameters.AddWithValue("status", newStatus.Trim());
        cmd.Parameters.AddWithValue("notes", string.IsNullOrWhiteSpace(notes) ? (object)DBNull.Value : notes.Trim());
        cmd.Parameters.AddWithValue("assignedTo", string.IsNullOrWhiteSpace(assignedTo) ? (object)DBNull.Value : assignedTo.Trim());
        cmd.Parameters.AddWithValue("updatedAt", DateTime.UtcNow);

        var rows = await cmd.ExecuteNonQueryAsync(cancellationToken);
        return rows > 0;
    }

    // Synchronous adapters
    public void AddQuote(QuoteInquiryDto quote) => AddQuoteAsync(quote).GetAwaiter().GetResult();
    public void AddDemo(DemoInquiryDto demo) => AddDemoAsync(demo).GetAwaiter().GetResult();
    public void AddSubscriber(SubscriberInquiryDto subscriber) => AddSubscriberAsync(subscriber).GetAwaiter().GetResult();
    public IReadOnlyList<QuoteInquiryDto> GetQuotes() => GetQuotesAsync().GetAwaiter().GetResult();
    public IReadOnlyList<DemoInquiryDto> GetDemos() => GetDemosAsync().GetAwaiter().GetResult();
    public IReadOnlyList<SubscriberInquiryDto> GetSubscribers() => GetSubscribersAsync().GetAwaiter().GetResult();
    public InquiriesSummaryDto GetSummary() => GetSummaryAsync(cancellationToken: CancellationToken.None).GetAwaiter().GetResult();

    private static string BuildFilterSql(string inquiryType, string? status, string? search)
    {
        var sql = inquiryType switch
        {
            "Quote" => """
                SELECT
                    "ReferenceCode", "ContactName", "Email", "Phone", "OrganizationName",
                    "TeamSize", "PlanName", "Tier", "DeploymentType", "RequestedModules",
                    "ScopeSummary", "EstimatedDelivery", "Status", "SubmittedAtUtc"
                FROM public."Inquiries"
                WHERE "InquiryType" = 'Quote' AND "IsDeleted" = FALSE
            """,
            "Demo" => """
                SELECT
                    "ReferenceCode", "ContactName", "Email", "Phone", "OrganizationName",
                    "PreferredDate", "PreferredTimeSlot", "Notes", "Status", "SubmittedAtUtc"
                FROM public."Inquiries"
                WHERE "InquiryType" = 'Demo' AND "IsDeleted" = FALSE
            """,
            _ => """
                SELECT
                    "Email", "Source", "Status", "SubmittedAtUtc"
                FROM public."Inquiries"
                WHERE "InquiryType" = 'Subscriber' AND "IsDeleted" = FALSE
            """
        };

        if (!string.IsNullOrWhiteSpace(status))
        {
            sql += " AND LOWER(\"Status\") = LOWER(@status)";
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            if (inquiryType == "Subscriber")
            {
                sql += " AND LOWER(\"Email\") LIKE @searchPattern";
            }
            else
            {
                sql += " AND (LOWER(\"ReferenceCode\") LIKE @searchPattern OR LOWER(\"ContactName\") LIKE @searchPattern OR LOWER(\"Email\") LIKE @searchPattern OR LOWER(COALESCE(\"OrganizationName\", '')) LIKE @searchPattern)";
            }
        }

        sql += " ORDER BY \"SubmittedAtUtc\" DESC;";
        return sql;
    }

    private static void BindFilterParameters(NpgsqlCommand cmd, string? status, string? search)
    {
        if (!string.IsNullOrWhiteSpace(status))
        {
            cmd.Parameters.AddWithValue("status", status.Trim());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            cmd.Parameters.AddWithValue("searchPattern", $"%{search.Trim().ToLowerInvariant()}%");
        }
    }

    private static QuoteInquiryDto MapQuote(NpgsqlDataReader reader)
    {
        var modules = reader.IsDBNull(9) ? [] : ((string[])reader.GetValue(9)).ToList();

        return new QuoteInquiryDto
        {
            ReferenceCode = reader.IsDBNull(0) ? string.Empty : reader.GetString(0),
            ContactName = reader.IsDBNull(1) ? string.Empty : reader.GetString(1),
            Email = reader.IsDBNull(2) ? string.Empty : reader.GetString(2),
            Phone = reader.IsDBNull(3) ? string.Empty : reader.GetString(3),
            OrganizationName = reader.IsDBNull(4) ? string.Empty : reader.GetString(4),
            TeamSize = reader.IsDBNull(5) ? string.Empty : reader.GetString(5),
            PlanName = reader.IsDBNull(6) ? string.Empty : reader.GetString(6),
            Tier = reader.IsDBNull(7) ? string.Empty : reader.GetString(7),
            DeploymentType = reader.IsDBNull(8) ? string.Empty : reader.GetString(8),
            RequestedModules = modules,
            ScopeSummary = reader.IsDBNull(10) ? string.Empty : reader.GetString(10),
            EstimatedDelivery = reader.IsDBNull(11) ? string.Empty : reader.GetString(11),
            Status = reader.IsDBNull(12) ? "Pending Review" : reader.GetString(12),
            SubmittedAtUtc = reader.GetDateTime(13)
        };
    }

    private static DemoInquiryDto MapDemo(NpgsqlDataReader reader)
    {
        return new DemoInquiryDto
        {
            ReferenceCode = reader.IsDBNull(0) ? string.Empty : reader.GetString(0),
            ContactName = reader.IsDBNull(1) ? string.Empty : reader.GetString(1),
            Email = reader.IsDBNull(2) ? string.Empty : reader.GetString(2),
            Phone = reader.IsDBNull(3) ? string.Empty : reader.GetString(3),
            OrganizationName = reader.IsDBNull(4) ? string.Empty : reader.GetString(4),
            PreferredDate = reader.IsDBNull(5) ? string.Empty : reader.GetString(5),
            PreferredTimeSlot = reader.IsDBNull(6) ? string.Empty : reader.GetString(6),
            Notes = reader.IsDBNull(7) ? string.Empty : reader.GetString(7),
            Status = reader.IsDBNull(8) ? "Confirmed" : reader.GetString(8),
            SubmittedAtUtc = reader.GetDateTime(9)
        };
    }

    private static SubscriberInquiryDto MapSubscriber(NpgsqlDataReader reader)
    {
        return new SubscriberInquiryDto
        {
            Email = reader.IsDBNull(0) ? string.Empty : reader.GetString(0),
            Source = reader.IsDBNull(1) ? string.Empty : reader.GetString(1),
            Status = reader.IsDBNull(2) ? "Active" : reader.GetString(2),
            SubscribedAtUtc = reader.GetDateTime(3)
        };
    }
}
