using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class DocumentProfileItemRepository
    : Repository<DocumentProfileItem>, IDocumentProfileItemRepository
{
    public DocumentProfileItemRepository(
        ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor) { }
}