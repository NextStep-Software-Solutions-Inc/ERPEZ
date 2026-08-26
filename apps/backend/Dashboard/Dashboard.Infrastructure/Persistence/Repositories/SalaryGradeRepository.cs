using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class SalaryGradeRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<Domain.Entities.Planning.SalaryGrade>(context, sieveProcessor),
      Domain.Interfaces.ISalaryGradeRepository
{
}
