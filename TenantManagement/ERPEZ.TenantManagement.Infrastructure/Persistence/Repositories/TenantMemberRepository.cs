using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using Sieve.Services;

namespace ERPEZ.TenantManagement.Infrastructure.Persistence.Repositories;

public class TenantMemberRepository(ApplicationDbContext context, ISieveProcessor sieveProcessor) : Repository<TenantMember>(context, sieveProcessor), ITenantMemberRepository
{
}