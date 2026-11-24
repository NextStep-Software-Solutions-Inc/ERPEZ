using ERPEZ.Shared.Common;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Application.Features.Billing.Dtos;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Billing.Commands.UpdateTenantBillingContact;

public class UpdateTenantBillingContactCommand : IRequest<ApiResponse<TenantBillingContactDto>>
{
    public Guid? TenantId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string BillingEmail { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
    public string? PostalCode { get; set; }
    public string? TaxId { get; set; }
}

public class UpdateTenantBillingContactCommandHandler(
    IUnitOfWork unitOfWork,
    ITenantContextService tenantContext)
    : IRequestHandler<UpdateTenantBillingContactCommand, ApiResponse<TenantBillingContactDto>>
{
    private static readonly Guid defaultDevTenantId = Guid.Parse("00000000-0000-0000-0000-000000000001");

    public async Task<ApiResponse<TenantBillingContactDto>> Handle(
        UpdateTenantBillingContactCommand command,
        CancellationToken cancellationToken)
    {
        var targetTenantId = command.TenantId
            ?? tenantContext.TenantId
            ?? defaultDevTenantId;

        var tenant = await unitOfWork.TenantRepository.FindAsync(
            t => t.Id == targetTenantId && !t.IsDeleted,
            cancellationToken);

        if (tenant != null && !string.IsNullOrWhiteSpace(command.CompanyName))
        {
            tenant.Name = command.CompanyName.Trim();
            tenant.UpdatedAt = DateTime.UtcNow;
            unitOfWork.TenantRepository.Update(tenant);
        }

        var setting = await unitOfWork.TenantSettingRepository.FindAsync(
            ts => ts.TenantId == targetTenantId && !ts.IsDeleted,
            cancellationToken);

        if (setting != null)
        {
            if (!string.IsNullOrWhiteSpace(command.BillingEmail))
                setting.BillingContactEmail = command.BillingEmail.Trim();

            setting.BillingAddress = command.Address;
            setting.BillingCity = command.City;
            setting.BillingCountry = command.Country;
            setting.BillingPostalCode = command.PostalCode;
            setting.TaxId = command.TaxId;
            setting.UpdatedAt = DateTime.UtcNow;

            unitOfWork.TenantSettingRepository.Update(setting);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new TenantBillingContactDto
        {
            CompanyName = tenant?.Name ?? command.CompanyName,
            BillingEmail = setting?.BillingContactEmail ?? command.BillingEmail,
            Address = setting?.BillingAddress ?? command.Address,
            City = setting?.BillingCity ?? command.City,
            Country = setting?.BillingCountry ?? command.Country,
            PostalCode = setting?.BillingPostalCode ?? command.PostalCode,
            TaxId = setting?.TaxId ?? command.TaxId
        };

        return ApiResponse<TenantBillingContactDto>.Success(dto);
    }
}
