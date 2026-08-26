using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Queries.GetTenantMemberByIdQuery;

public class GetTenantMemberByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetTenantMemberByIdQuery, ApiResponse<TenantMember>>
{
    public async Task<ApiResponse<TenantMember>> Handle(
        GetTenantMemberByIdQuery request,
        CancellationToken cancellationToken)
    {
        var tenantSetting = await unitOfWork.TenantMemberRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Tenant member not found.");

        return ApiResponse<TenantMember>.Success(tenantSetting, "Tenant member retrieved successfully.");
    }
}
