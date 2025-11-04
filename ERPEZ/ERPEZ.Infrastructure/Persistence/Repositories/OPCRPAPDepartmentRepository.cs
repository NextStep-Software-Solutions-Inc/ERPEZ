using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class OPCRPAPDepartmentRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) 
    : Repository<Domain.Entities.Planning.OPCRPAPDepartment>(context, sieveProcessor), 
      Domain.Interfaces.IOPCRPAPDepartmentRepository
{
}
