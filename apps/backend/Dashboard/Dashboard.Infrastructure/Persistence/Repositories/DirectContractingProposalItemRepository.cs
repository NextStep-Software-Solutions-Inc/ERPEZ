using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.Infrastructure.Persistence.Repositories;

public class DirectContractingProposalItemRepository : Repository<DirectContractingProposalItem>, IDirectContractingProposalItemRepository
{
    public DirectContractingProposalItemRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor)
        : base(context, sieveProcessor)
    {
    }
}
