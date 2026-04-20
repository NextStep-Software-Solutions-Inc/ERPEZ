using ERPEZ.Domain.Entities.Planning;
using Sieve.Models;

namespace ERPEZ.Domain.Interfaces;

public interface IPPMPItemAllocationRepository : IRepository<PPMPItemAllocation>
{
	Task<(IReadOnlyList<PPMPItemAllocation> Entities, int TotalCount)> GetDetailedPagedAsync(SieveModel sieveModel, CancellationToken cancellationToken = default);
	Task<PPMPItemAllocation?> GetByIdWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
}
