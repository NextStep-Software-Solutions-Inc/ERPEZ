using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class PPMPExpenditureItemRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<PPMPExpenditureItem>(context, sieveProcessor), IPPMPExpenditureItemRepository
{
}
