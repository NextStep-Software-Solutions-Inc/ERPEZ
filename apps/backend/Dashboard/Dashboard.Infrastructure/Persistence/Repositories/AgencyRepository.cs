using System.Linq.Expressions;
using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class AgencyRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Agency>(context, sieveProcessor), IAgencyRepository
{
    private readonly ApplicationDbContext dbContext = context;

    public override async Task<Agency?> FindAsync(
        Expression<Func<Agency, bool>> predicate,
        CancellationToken cancellationToken = default)
    {
        try
        {
            return await base.FindAsync(predicate, cancellationToken);
        }
        catch (PostgresException ex) when (IsMissingLetterheadAlignmentColumn(ex))
        {
            if (await TryEnsureLetterheadAlignmentColumnAsync(cancellationToken))
            {
                return await base.FindAsync(predicate, cancellationToken);
            }

            return await FindOneWithoutLetterheadAlignmentAsync(predicate, cancellationToken);
        }
    }

    public override async Task<Agency?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            return await base.GetByIdAsync(id, cancellationToken);
        }
        catch (PostgresException ex) when (IsMissingLetterheadAlignmentColumn(ex))
        {
            if (await TryEnsureLetterheadAlignmentColumnAsync(cancellationToken))
            {
                return await base.GetByIdAsync(id, cancellationToken);
            }

            return await FindOneWithoutLetterheadAlignmentAsync(a => a.Id == id, cancellationToken);
        }
    }

    public override async Task<List<Agency>> FindAllAsync(
        Expression<Func<Agency, bool>> predicate,
        CancellationToken cancellationToken = default)
    {
        try
        {
            return await base.FindAllAsync(predicate, cancellationToken);
        }
        catch (PostgresException ex) when (IsMissingLetterheadAlignmentColumn(ex))
        {
            if (await TryEnsureLetterheadAlignmentColumnAsync(cancellationToken))
            {
                return await base.FindAllAsync(predicate, cancellationToken);
            }

            return await FindListWithoutLetterheadAlignmentAsync(predicate, cancellationToken);
        }
    }

    private static bool IsMissingLetterheadAlignmentColumn(PostgresException ex)
    {
        return ex.SqlState == PostgresErrorCodes.UndefinedColumn &&
               ex.MessageText.Contains(nameof(Agency.LetterheadAlignment), StringComparison.OrdinalIgnoreCase);
    }

    private async Task<bool> TryEnsureLetterheadAlignmentColumnAsync(CancellationToken cancellationToken)
    {
        if (!dbContext.Database.IsRelational() || dbContext.Database.CurrentTransaction != null)
        {
            return false;
        }

        var connStr = dbContext.Database.GetConnectionString();
        if (string.IsNullOrWhiteSpace(connStr))
        {
            return false;
        }

        try
        {
            await using var conn = new NpgsqlConnection(connStr);
            await conn.OpenAsync(cancellationToken);

            const string sql = """
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.tables
                        WHERE table_schema = 'planning' AND table_name = 'Agencies'
                    ) THEN
                        ALTER TABLE planning."Agencies"
                            ADD COLUMN IF NOT EXISTS "LetterheadAlignment" character varying(50) NOT NULL DEFAULT 'Default';
                    END IF;
                END $$;
                """;

            await using var cmd = new NpgsqlCommand(sql, conn);
            await cmd.ExecuteNonQueryAsync(cancellationToken);
            return true;
        }
        catch
        {
            return false;
        }
    }

    private IQueryable<LegacyAgencyProjection> BuildLegacyProjectionQuery(Expression<Func<Agency, bool>> predicate)
    {
        return dbContext.Set<Agency>()
            .AsNoTracking()
            .Where(a => !a.IsDeleted)
            .Where(predicate)
            .Select(a => new LegacyAgencyProjection
            {
                Id = a.Id,
                TenantId = a.TenantId,
                Name = a.Name,
                Address = a.Address,
                LogoImage = a.LogoImage,
                IsDeleted = a.IsDeleted,
                CreatedAt = a.CreatedAt,
                CreatedBy = a.CreatedBy,
                UpdatedAt = a.UpdatedAt,
                UpdatedBy = a.UpdatedBy,
                DeletedAt = a.DeletedAt,
                DeletedBy = a.DeletedBy
            });
    }

    private async Task<Agency?> FindOneWithoutLetterheadAlignmentAsync(
        Expression<Func<Agency, bool>> predicate,
        CancellationToken cancellationToken)
    {
        var row = await BuildLegacyProjectionQuery(predicate).FirstOrDefaultAsync(cancellationToken);
        return row?.ToEntity();
    }

    private async Task<List<Agency>> FindListWithoutLetterheadAlignmentAsync(
        Expression<Func<Agency, bool>> predicate,
        CancellationToken cancellationToken)
    {
        var rows = await BuildLegacyProjectionQuery(predicate).ToListAsync(cancellationToken);
        return rows.Select(r => r.ToEntity()).ToList();
    }

    private sealed class LegacyAgencyProjection
    {
        public Guid Id { get; init; }
        public Guid TenantId { get; init; }
        public string Name { get; init; } = string.Empty;
        public string Address { get; init; } = string.Empty;
        public byte[]? LogoImage { get; init; }
        public bool IsDeleted { get; init; }
        public DateTime CreatedAt { get; init; }
        public string CreatedBy { get; init; } = string.Empty;
        public DateTime? UpdatedAt { get; init; }
        public string? UpdatedBy { get; init; }
        public DateTime? DeletedAt { get; init; }
        public string? DeletedBy { get; init; }

        public Agency ToEntity() => new()
        {
            Id = Id,
            TenantId = TenantId,
            Name = Name,
            Address = Address,
            LogoImage = LogoImage,
            LetterheadAlignment = "Default",
            IsDeleted = IsDeleted,
            CreatedAt = CreatedAt,
            CreatedBy = CreatedBy,
            UpdatedAt = UpdatedAt,
            UpdatedBy = UpdatedBy,
            DeletedAt = DeletedAt,
            DeletedBy = DeletedBy
        };
    }
}
