using ERPEZ.Shared.Common;
using ERPEZ.TenantManagement.Domain.Enums;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Licenses.Commands.RevokeLicenseKey;

public record RevokeLicenseKeyCommand(Guid LicenseKeyId, string? Reason = null) : IRequest<ApiResponse<Unit>>;

public class RevokeLicenseKeyCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<RevokeLicenseKeyCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(RevokeLicenseKeyCommand request, CancellationToken cancellationToken)
    {
        var license = await unitOfWork.LicenseKeyRepository.GetByIdAsync(request.LicenseKeyId, cancellationToken);
        if (license == null)
        {
            return ApiResponse<Unit>.Fail("License key not found.");
        }

        license.Status = LicenseStatus.Revoked;
        if (!string.IsNullOrWhiteSpace(request.Reason))
        {
            license.Notes = string.IsNullOrWhiteSpace(license.Notes)
                ? $"Revoked: {request.Reason}"
                : $"{license.Notes} | Revoked: {request.Reason}";
        }

        unitOfWork.LicenseKeyRepository.Update(license);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "License key revoked successfully.");
    }
}
