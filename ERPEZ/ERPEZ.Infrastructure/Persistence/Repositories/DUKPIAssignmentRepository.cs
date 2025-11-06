using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class DUKPIAssignmentRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) : Repository<Domain.Entities.Planning.DUKPIAssignment>(context, sieveProcessor), Domain.Interfaces.IDUKPIAssignmentRepository
{
}
