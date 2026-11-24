using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class WFPPAPDepartmentRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.WFPPAPDepartment>(context, sieveProcessor),
      Domain.Interfaces.IWFPPAPDepartmentRepository
{
}
