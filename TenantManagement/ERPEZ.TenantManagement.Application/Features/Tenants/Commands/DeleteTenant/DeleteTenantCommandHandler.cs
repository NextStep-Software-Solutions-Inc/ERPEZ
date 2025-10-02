using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Commands.DeleteTenant;

public sealed class DeleteTenantCommandHandler(IUnitOfWork unitOfWork): IRequestHandler<DeleteTenantCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteTenantCommand request, CancellationToken cancellationToken)
    {
        var tenant = await unitOfWork.TenantRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken);

        if (tenant == null) return ApiResponse<Unit>.Fail("Tenant not found.");

        unitOfWork.TenantRepository.Remove(tenant);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Tenant with ID {request.Id} deleted successfully.");
    }
}