using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class SDGRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) : Repository<SDG>(context, sieveProcessor), ISDGRepository
{
}
