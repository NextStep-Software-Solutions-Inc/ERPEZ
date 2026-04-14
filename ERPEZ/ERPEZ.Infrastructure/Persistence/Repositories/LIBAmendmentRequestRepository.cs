using ERPEZ.Domain.Entities.Planning;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class LIBAmendmentRequestRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
    : Repository<LIBAmendmentRequest>(context, sieveProcessor), ILIBAmendmentRequestRepository
{
}