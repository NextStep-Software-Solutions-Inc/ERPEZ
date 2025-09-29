using ERPEZ.TenantManagement.Application.Common;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.Tenants.Commands.DeleteTenant;

public sealed class DeleteTenantCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteTenantCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteTenantCommand request, CancellationToken cancellationToken)
    {
        var tenant = await unitOfWork.TenantRepository.FindAsync(t => t.Id == request.Id && !t.IsDeleted, cancellationToken: cancellationToken);

        if (tenant == null)
        {
            return new ApiResponse<Unit>()
            {
                Succeeded = false,
                Message = "Tenant not found."
            };
        }

        tenant.MarkAsDeleted(request.Id);

        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, $"Tenant with ID {request.Id} deleted successfully.");
    }
}