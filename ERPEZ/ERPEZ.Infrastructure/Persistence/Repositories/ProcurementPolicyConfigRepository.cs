using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Infrastructure.Persistence;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class ProcurementPolicyConfigRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) 
    : Repository<ProcurementPolicyConfig>(context, sieveProcessor), IProcurementPolicyConfigRepository
{
}
