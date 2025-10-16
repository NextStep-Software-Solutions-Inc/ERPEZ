using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class KPIAssignmentRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) : Repository<Domain.Entities.Planning.KPIAssignment>(context, sieveProcessor), Domain.Interfaces.IKPIAssignmentRepository
{
}
