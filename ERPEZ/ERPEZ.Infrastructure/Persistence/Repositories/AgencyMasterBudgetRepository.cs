using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class AgencyMasterBudgetRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<AgencyMasterBudget>(context, sieveProcessor), IAgencyMasterBudgetRepository
{
}