using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class DirectAcquisitionDocumentRepository : Repository<DirectAcquisitionDocument>, IDirectAcquisitionDocumentRepository
{
    public DirectAcquisitionDocumentRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
    }
}
