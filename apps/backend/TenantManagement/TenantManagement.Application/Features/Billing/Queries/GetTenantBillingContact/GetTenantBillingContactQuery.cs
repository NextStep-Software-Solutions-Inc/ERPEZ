using ERPEZ.Shared.Common;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Application.Features.Billing.Dtos;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Billing.Queries.GetTenantBillingContact;

public record GetTenantBillingContactQuery(Guid? TenantId = null) : IRequest<ApiResponse<TenantBillingContactDto>>;

public class GetTenantBillingContactQueryHandler(
    IUnitOfWork unitOfWork,
    ITenantContextService tenantContext)
    : IRequestHandler<GetTenantBillingContactQuery, ApiResponse<TenantBillingContactDto>>
{
    private static readonly Guid defaultDevTenantId = Guid.Parse("00000000-0000-0000-0000-000000000001");

    public async Task<ApiResponse<TenantBillingContactDto>> Handle(
        GetTenantBillingContactQuery query,
        CancellationToken cancellationToken)
    {
        var targetTenantId = query.TenantId
            ?? tenantContext.TenantId
            ?? defaultDevTenantId;

        var tenant = await unitOfWork.TenantRepository.FindAsync(
            t => t.Id == targetTenantId && !t.IsDeleted,
            cancellationToken);

        var setting = await unitOfWork.TenantSettingRepository.FindAsync(
            ts => ts.TenantId == targetTenantId && !ts.IsDeleted,
            cancellationToken);

        var dto = new TenantBillingContactDto
        {
            CompanyName = tenant?.Name ?? "ERPEZ Dev Sandbox",
            BillingEmail = setting?.BillingContactEmail ?? "dev@erpez.local",
            Address = setting?.BillingAddress ?? "100 Enterprise Boulevard, Suite 400",
            City = setting?.BillingCity ?? "San Francisco",
            Country = setting?.BillingCountry ?? "United States",
            PostalCode = setting?.BillingPostalCode ?? "94105",
            TaxId = setting?.TaxId ?? "US-987654321"
        };

        return ApiResponse<TenantBillingContactDto>.Success(dto);
    }
}
