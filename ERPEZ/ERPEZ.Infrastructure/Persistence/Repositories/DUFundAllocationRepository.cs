using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class DUFundAllocationRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) 
    : Repository<Domain.Entities.Planning.DUFundAllocation>(context, sieveProcessor), 
      Domain.Interfaces.IDUFundAllocationRepository
{
}
