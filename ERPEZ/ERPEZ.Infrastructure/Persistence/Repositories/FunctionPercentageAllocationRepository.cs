using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class FunctionAllocationRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.FunctionAllocation>(context, sieveProcessor),
      Domain.Interfaces.IFunctionAllocationRepository
{
}
