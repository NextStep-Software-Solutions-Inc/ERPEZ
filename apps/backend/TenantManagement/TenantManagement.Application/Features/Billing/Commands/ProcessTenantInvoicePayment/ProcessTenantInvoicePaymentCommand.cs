using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Application.Features.Billing.Dtos;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Application.Features.Billing.Commands.ProcessTenantInvoicePayment;

public record ProcessTenantInvoicePaymentCommand(Guid InvoiceId, Guid PaymentMethodId)
    : IRequest<ApiResponse<TenantInvoiceDto>>;

public class ProcessTenantInvoicePaymentCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<ProcessTenantInvoicePaymentCommand, ApiResponse<TenantInvoiceDto>>
{
    public async Task<ApiResponse<TenantInvoiceDto>> Handle(
        ProcessTenantInvoicePaymentCommand command,
        CancellationToken cancellationToken)
    {
        var invoice = await unitOfWork.TenantInvoiceRepository.FindAsync(
            inv => inv.Id == command.InvoiceId && !inv.IsDeleted,
            cancellationToken);

        if (invoice == null)
        {
            return ApiResponse<TenantInvoiceDto>.Fail("Invoice not found.");
        }

        if (invoice.Status == InvoiceStatus.Paid)
        {
            return ApiResponse<TenantInvoiceDto>.Fail("Invoice is already paid.");
        }

        var paymentMethod = await unitOfWork.TenantPaymentMethodRepository.FindAsync(
            pm => pm.Id == command.PaymentMethodId && pm.TenantId == invoice.TenantId && !pm.IsDeleted,
            cancellationToken);

        if (paymentMethod == null)
        {
            return ApiResponse<TenantInvoiceDto>.Fail("Selected payment method not found for this tenant.");
        }

        var brand = string.IsNullOrWhiteSpace(paymentMethod.Brand) ? "Card" : paymentMethod.Brand.ToUpper();
        invoice.Status = InvoiceStatus.Paid;
        invoice.PaidDate = DateTime.UtcNow;
        invoice.PaymentMethodSummary = $"{brand} ending in {paymentMethod.Last4}";
        invoice.UpdatedAt = DateTime.UtcNow;

        unitOfWork.TenantInvoiceRepository.Update(invoice);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var updatedInvoice = await unitOfWork.TenantInvoiceRepository
            .Query(inv => inv.Id == invoice.Id)
            .Include(inv => inv.Items)
            .FirstOrDefaultAsync(cancellationToken);

        var dto = new TenantInvoiceDto
        {
            Id = updatedInvoice!.Id,
            TenantId = updatedInvoice.TenantId,
            TenantSubscriptionId = updatedInvoice.TenantSubscriptionId,
            InvoiceNumber = updatedInvoice.InvoiceNumber,
            PlanName = updatedInvoice.PlanName,
            BillingCycle = updatedInvoice.BillingCycle.ToString().ToLower(),
            InvoiceDate = updatedInvoice.InvoiceDate,
            DueDate = updatedInvoice.DueDate,
            PaidDate = updatedInvoice.PaidDate,
            SubtotalAmount = updatedInvoice.SubtotalAmount,
            TaxRate = updatedInvoice.TaxRate,
            TaxAmount = updatedInvoice.TaxAmount,
            TotalAmount = updatedInvoice.TotalAmount,
            Currency = updatedInvoice.Currency,
            Status = updatedInvoice.Status.ToString().ToLower(),
            PaymentMethodSummary = updatedInvoice.PaymentMethodSummary,
            Items = updatedInvoice.Items.Select(item => new TenantInvoiceItemDto
            {
                Id = item.Id,
                Description = item.Description,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                TotalPrice = item.TotalPrice
            }).ToList()
        };

        return ApiResponse<TenantInvoiceDto>.Success(dto);
    }
}
