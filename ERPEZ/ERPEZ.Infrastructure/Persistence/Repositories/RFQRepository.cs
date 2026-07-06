using ERPEZ.Application.Interfaces;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.Infrastructure.Repositories;

public class RFQRepository(ApplicationDbContext context) : IRFQRepository
{
    public async Task<RFQ?> GetByIdAsync(Guid id, bool includeDetails = false, CancellationToken cancellationToken = default)
    {
        var query = context.RFQs!.AsQueryable();

        if (includeDetails)
        {
            query = query
                .Include(r => r.ModeOfProcurement)
                .Include(r => r.RFQItems)
                    .ThenInclude(i => i.CPRItem)
                .Include(r => r.RFQSuppliers)
                    .ThenInclude(s => s.Supplier);
        }

        return await query.FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }

    public async Task<RFQ?> GetByRFQNumberAsync(string rfqNumber, CancellationToken cancellationToken = default)
        => await context.RFQs!.FirstOrDefaultAsync(r => r.RFQNumber == rfqNumber, cancellationToken);

    public async Task<bool> RFQNumberExistsAsync(string rfqNumber, CancellationToken cancellationToken = default)
        => await context.RFQs!.AnyAsync(r => r.RFQNumber == rfqNumber, cancellationToken);

    public async Task<bool> TracingNumberExistsAsync(string tracingNumber, CancellationToken cancellationToken = default)
        => await context.RFQs!.AnyAsync(r => r.TracingNumber == tracingNumber, cancellationToken);

    public async Task AddAsync(RFQ rfq, CancellationToken cancellationToken = default)
        => await context.RFQs!.AddAsync(rfq, cancellationToken);

    public void Update(RFQ rfq) => context.RFQs!.Update(rfq);

    public void Remove(RFQ rfq) => context.RFQs!.Remove(rfq);

    public async Task<RFQItem?> GetItemByIdAsync(Guid rfqItemId, CancellationToken cancellationToken = default)
        => await context.RFQItems!.FirstOrDefaultAsync(i => i.Id == rfqItemId, cancellationToken);

    public void RemoveItem(RFQItem item) => context.RFQItems!.Remove(item);

    public async Task<int> GetSourcedQuantityForCprItemAsync(
        Guid cprItemId,
        Guid? excludingRfqId = null,
        CancellationToken cancellationToken = default)
    {
        var query = context.RFQItems!
            .Include(i => i.RFQ)
            .Where(i => i.CPRItemId == cprItemId
                        && i.RFQ.Status != nameof(StatusEnum.Returned));

        if (excludingRfqId.HasValue)
        {
            query = query.Where(i => i.RFQId != excludingRfqId.Value);
        }

        return await query.SumAsync(i => i.Quantity, cancellationToken);
    }

    public async Task<(int Total, int Draft, int Submitted, int Approved, int Returned)> GetSummaryAsync(
        CancellationToken cancellationToken = default)
    {
        var total = await context.RFQs!.CountAsync(cancellationToken);
        var draft = await context.RFQs!.CountAsync(r => r.Status == nameof(StatusEnum.Draft), cancellationToken);
        var submitted = await context.RFQs!.CountAsync(r => r.Status == nameof(StatusEnum.Submitted), cancellationToken);
        var approved = await context.RFQs!.CountAsync(r => r.Status == nameof(StatusEnum.Approved), cancellationToken);
        var returned = await context.RFQs!.CountAsync(r => r.Status == nameof(StatusEnum.Returned), cancellationToken);

        return (total, draft, submitted, approved, returned);
    }
}
