using ERPEZ.Shared.Common;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Application.Features.Billing.Dtos;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.TenantManagement.Application.Features.Billing.Queries.GetTenantInvoices;

public class GetTenantInvoicesQuery : SieveModel, IRequest<PaginatedApiResponse<TenantInvoiceDto>>
{
    public Guid? TenantId { get; set; }
    public string? Status { get; set; }
    public string? Search { get; set; }
}

public class GetTenantInvoicesQueryHandler(
    IUnitOfWork unitOfWork,
    ITenantContextService tenantContext)
    : IRequestHandler<GetTenantInvoicesQuery, PaginatedApiResponse<TenantInvoiceDto>>
{
    private static readonly Guid defaultDevTenantId = Guid.Parse("00000000-0000-0000-0000-000000000001");

    public async Task<PaginatedApiResponse<TenantInvoiceDto>> Handle(
        GetTenantInvoicesQuery query,
        CancellationToken cancellationToken)
    {
        var targetTenantId = query.TenantId
            ?? tenantContext.TenantId
            ?? defaultDevTenantId;

        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize ?? 50,
            Page = query.Page ?? 1,
            Filters = query.Filters,
            Sorts = query.Sorts ?? "-InvoiceDate"
        };

        Expression<Func<TenantInvoice, TenantInvoiceDto>> projection = inv => new TenantInvoiceDto
        {
            Id = inv.Id,
            TenantId = inv.TenantId,
            TenantSubscriptionId = inv.TenantSubscriptionId,
            InvoiceNumber = inv.InvoiceNumber,
            PlanName = inv.PlanName,
            BillingCycle = inv.BillingCycle.ToString().ToLower(),
            InvoiceDate = inv.InvoiceDate,
            DueDate = inv.DueDate,
            PaidDate = inv.PaidDate,
            SubtotalAmount = inv.SubtotalAmount,
            TaxRate = inv.TaxRate,
            TaxAmount = inv.TaxAmount,
            TotalAmount = inv.TotalAmount,
            Currency = inv.Currency,
            Status = inv.Status.ToString().ToLower(),
            PaymentMethodSummary = inv.PaymentMethodSummary,
            Items = inv.Items.Select(item => new TenantInvoiceItemDto
            {
                Id = item.Id,
                Description = item.Description,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                TotalPrice = item.TotalPrice
            }).ToList()
        };

        var (invoices, totalCount) = await unitOfWork.TenantInvoiceRepository.GetAllAsync(
            sieveModel,
            projection,
            inv => inv.TenantId == targetTenantId && !inv.IsDeleted,
            cancellationToken);

        // In-memory search fallback if query.Search provided
        var resultList = invoices.ToList();
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var s = query.Search.Trim().ToLower();
            resultList = resultList
                .Where(inv => inv.InvoiceNumber.ToLower().Contains(s)
                           || inv.PlanName.ToLower().Contains(s)
                           || (inv.PaymentMethodSummary != null && inv.PaymentMethodSummary.ToLower().Contains(s))
                           || inv.Items.Any(i => i.Description.ToLower().Contains(s)))
                .ToList();
        }

        if (!string.IsNullOrWhiteSpace(query.Status) && query.Status.ToLower() != "all")
        {
            var st = query.Status.Trim().ToLower();
            resultList = resultList.Where(inv => inv.Status.ToLower() == st).ToList();
        }

        return new PaginatedApiResponse<TenantInvoiceDto>(
            resultList,
            query.Page ?? 1,
            query.PageSize ?? 50,
            totalCount);
    }
}
