using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.Billing.Dtos;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Application.Features.Billing.Queries.GetTenantInvoiceById;

public record GetTenantInvoiceByIdQuery(Guid Id) : IRequest<ApiResponse<TenantInvoiceDto?>>;

public class GetTenantInvoiceByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetTenantInvoiceByIdQuery, ApiResponse<TenantInvoiceDto?>>
{
    public async Task<ApiResponse<TenantInvoiceDto?>> Handle(
        GetTenantInvoiceByIdQuery query,
        CancellationToken cancellationToken)
    {
        var invoiceQuery = unitOfWork.TenantInvoiceRepository
            .Query(inv => inv.Id == query.Id && !inv.IsDeleted)
            .Include(inv => inv.Items);

        var inv = await invoiceQuery.FirstOrDefaultAsync(cancellationToken);

        if (inv == null)
        {
            return ApiResponse<TenantInvoiceDto?>.Fail("Invoice not found.");
        }

        var dto = new TenantInvoiceDto
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

        return ApiResponse<TenantInvoiceDto?>.Success(dto);
    }
}
