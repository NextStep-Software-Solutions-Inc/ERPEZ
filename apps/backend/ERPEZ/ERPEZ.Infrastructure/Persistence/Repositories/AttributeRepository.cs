using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public sealed class AttributeRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) : Repository<Domain.Entities.Planning.Attribute>(context, sieveProcessor), IAttributeRepository
{
}
