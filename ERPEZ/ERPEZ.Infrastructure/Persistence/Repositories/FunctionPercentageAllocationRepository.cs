using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class FunctionPercentageAllocationRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) 
    : Repository<Domain.Entities.Planning.FunctionPercentageAllocation>(context, sieveProcessor), 
      Domain.Interfaces.IFunctionPercentageAllocationRepository
{
}
