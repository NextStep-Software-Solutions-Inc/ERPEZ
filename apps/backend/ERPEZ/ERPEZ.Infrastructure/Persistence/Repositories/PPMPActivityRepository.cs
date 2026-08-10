using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class PPMPActivityRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<PPMPActivity>(context, sieveProcessor), IPPMPActivityRepository
{
}
