using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class PPMPItemAllocationRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<PPMPItemAllocation>(context, sieveProcessor), IPPMPItemAllocationRepository
{
}
