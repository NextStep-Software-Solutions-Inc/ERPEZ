using ERPEZ.Shared.Common;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Application.Features.Billing.Dtos;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.TenantManagement.Application.Features.Billing.Queries.GetTenantPaymentMethods;

public record GetTenantPaymentMethodsQuery(Guid? TenantId = null) : IRequest<ApiResponse<List<TenantPaymentMethodDto>>>;

public class GetTenantPaymentMethodsQueryHandler(
    IUnitOfWork unitOfWork,
    ITenantContextService tenantContext)
    : IRequestHandler<GetTenantPaymentMethodsQuery, ApiResponse<List<TenantPaymentMethodDto>>>
{
    private static readonly Guid defaultDevTenantId = Guid.Parse("00000000-0000-0000-0000-000000000001");

    public async Task<ApiResponse<List<TenantPaymentMethodDto>>> Handle(
        GetTenantPaymentMethodsQuery query,
        CancellationToken cancellationToken)
    {
        var targetTenantId = query.TenantId
            ?? tenantContext.TenantId
            ?? defaultDevTenantId;

        Expression<Func<TenantPaymentMethod, TenantPaymentMethodDto>> projection = pm => new TenantPaymentMethodDto
        {
            Id = pm.Id,
            TenantId = pm.TenantId,
            Type = pm.Type == PaymentMethodType.CreditCard ? "credit_card" :
                   pm.Type == PaymentMethodType.BankTransfer ? "bank_transfer" : "ewallet",
            Brand = pm.Brand,
            Last4 = pm.Last4,
            ExpiryMonth = pm.ExpiryMonth,
            ExpiryYear = pm.ExpiryYear,
            CardholderName = pm.CardholderName,
            IsDefault = pm.IsDefault,
            CreatedAt = pm.CreatedAt
        };

        var (methods, _) = await unitOfWork.TenantPaymentMethodRepository.GetAllAsync(
            null!,
            projection,
            pm => pm.TenantId == targetTenantId && !pm.IsDeleted,
            cancellationToken);

        // Sort: default first, then newest
        var sorted = methods
            .OrderByDescending(pm => pm.IsDefault)
            .ThenByDescending(pm => pm.CreatedAt)
            .ToList();

        return ApiResponse<List<TenantPaymentMethodDto>>.Success(sorted);
    }
}
