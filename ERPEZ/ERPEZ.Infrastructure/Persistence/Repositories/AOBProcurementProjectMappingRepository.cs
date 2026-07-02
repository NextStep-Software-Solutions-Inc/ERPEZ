using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class AOBProcurementProjectMappingRepository : Repository<AOBProcurementProjectMapping>, IAOBProcurementProjectMappingRepository
{
    public AOBProcurementProjectMappingRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
    }
}
