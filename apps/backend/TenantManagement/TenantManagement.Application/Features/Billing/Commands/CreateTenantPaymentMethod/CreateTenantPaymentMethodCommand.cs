using ERPEZ.Shared.Common;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Application.Features.Billing.Dtos;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using System.Text.RegularExpressions;

namespace ERPEZ.TenantManagement.Application.Features.Billing.Commands.CreateTenantPaymentMethod;

public class CreateTenantPaymentMethodCommand : IRequest<ApiResponse<TenantPaymentMethodDto>>
{
    public Guid? TenantId { get; set; }
    public string Type { get; set; } = "credit_card";
    public string CardNumber { get; set; } = string.Empty;
    public string CardholderName { get; set; } = string.Empty;
    public int ExpiryMonth { get; set; }
    public int ExpiryYear { get; set; }
    public string? Cvc { get; set; }
    public bool SetAsDefault { get; set; }
}

public class CreateTenantPaymentMethodCommandHandler(
    IUnitOfWork unitOfWork,
    ITenantContextService tenantContext)
    : IRequestHandler<CreateTenantPaymentMethodCommand, ApiResponse<TenantPaymentMethodDto>>
{
    private static readonly Guid defaultDevTenantId = Guid.Parse("00000000-0000-0000-0000-000000000001");

    public async Task<ApiResponse<TenantPaymentMethodDto>> Handle(
        CreateTenantPaymentMethodCommand command,
        CancellationToken cancellationToken)
    {
        var targetTenantId = command.TenantId
            ?? tenantContext.TenantId
            ?? defaultDevTenantId;

        var cleanDigits = Regex.Replace(command.CardNumber, @"\D", "");
        var last4 = cleanDigits.Length >= 4 ? cleanDigits[^4..] : "4242";

        // Detect brand
        string brand = "other";
        if (cleanDigits.StartsWith("4")) brand = "visa";
        else if (Regex.IsMatch(cleanDigits, @"^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)")) brand = "mastercard";
        else if (Regex.IsMatch(cleanDigits, @"^3[47]")) brand = "amex";
        else if (cleanDigits.StartsWith("6")) brand = "discover";

        var existingMethodsQuery = unitOfWork.TenantPaymentMethodRepository.Query(pm => pm.TenantId == targetTenantId && !pm.IsDeleted);
        var existingMethods = await unitOfWork.TenantPaymentMethodRepository.ToListAsync(existingMethodsQuery, cancellationToken);

        var isFirst = existingMethods.Count == 0;
        var makeDefault = isFirst || command.SetAsDefault;

        if (makeDefault && existingMethods.Count > 0)
        {
            foreach (var pm in existingMethods.Where(pm => pm.IsDefault))
            {
                pm.IsDefault = false;
                pm.UpdatedAt = DateTime.UtcNow;
            }
        }

        var newMethod = new TenantPaymentMethod
        {
            Id = Guid.NewGuid(),
            TenantId = targetTenantId,
            Type = PaymentMethodType.CreditCard,
            Brand = brand,
            Last4 = last4,
            ExpiryMonth = command.ExpiryMonth,
            ExpiryYear = command.ExpiryYear,
            CardholderName = command.CardholderName.Trim(),
            IsDefault = makeDefault,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = "system"
        };

        await unitOfWork.TenantPaymentMethodRepository.AddAsync(newMethod, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new TenantPaymentMethodDto
        {
            Id = newMethod.Id,
            TenantId = newMethod.TenantId,
            Type = newMethod.Type switch
            {
                PaymentMethodType.CreditCard => "credit_card",
                PaymentMethodType.BankTransfer => "bank_transfer",
                PaymentMethodType.EWallet => "ewallet",
                _ => "credit_card"
            },
            Brand = newMethod.Brand,
            Last4 = newMethod.Last4,
            ExpiryMonth = newMethod.ExpiryMonth,
            ExpiryYear = newMethod.ExpiryYear,
            CardholderName = newMethod.CardholderName,
            IsDefault = newMethod.IsDefault,
            CreatedAt = newMethod.CreatedAt
        };

        return ApiResponse<TenantPaymentMethodDto>.Success(dto);
    }
}
