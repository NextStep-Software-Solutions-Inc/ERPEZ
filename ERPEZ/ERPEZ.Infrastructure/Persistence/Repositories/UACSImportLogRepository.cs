using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

/// <summary>
/// Repository implementation for managing UACS import log operations.
/// </summary>
public class UACSImportLogRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<UACSImportLog>(context, sieveProcessor), IUACSImportLogRepository
{
}
