using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class DUAllocationRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) 
    : Repository<Domain.Entities.Planning.DUAllocation>(context, sieveProcessor), 
      Domain.Interfaces.IDUAllocationRepository
{
}
