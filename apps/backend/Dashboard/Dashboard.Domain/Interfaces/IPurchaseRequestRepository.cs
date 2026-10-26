using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Models;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Domain.Interfaces;

public interface IPurchaseRequestRepository : IRepository<PurchaseRequest>
{
    Task<PurchaseRequest?> GetPRWithDetailsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PurchaseRequest?> GetPRWithItemsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<PurchaseRequest>> GetApprovedPRsWithItemsAsync(CancellationToken cancellationToken = default);
    Task<List<PurchaseRequest>> GetByOfficeAsync(Guid officeId, PRType? prType = null, CancellationToken cancellationToken = default);
    Task<List<EligiblePPMPItemResult>> GetEligibleNonCSEItemsAsync(Guid officeId, Guid? currentPRId = null, CancellationToken cancellationToken = default);
    Task<List<EligibleAPRItemResult>> GetEligibleOutOfStockItemsAsync(Guid officeId, Guid? currentPRId = null, CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<PurchaseRequest> Entities, int TotalCount)> GetDetailedPagedAsync(
        SieveModel sieveModel, CancellationToken cancellationToken = default);
    Task<decimal> GetTotalApprovedPPMPBudgetAsync(Guid? officeId, PRType prType, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<TDto> Entities, int TotalCount)> GetPRsWithDetailsAsync<TDto>(
        SieveModel sieveModel,
        Expression<Func<PurchaseRequest, TDto>> projection,
        List<Expression<Func<PurchaseRequest, object>>> includes,
        CancellationToken cancellationToken = default) where TDto : class;
}