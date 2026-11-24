using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class FiscalMonthRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) 
    : Repository<FiscalMonth>(context, sieveProcessor), IFiscalMonthRepository
{
}
