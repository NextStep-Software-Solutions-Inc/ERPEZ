using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.Shared.Interfaces;
using ERPEZ.TenantManagement.Application.Features.TenantMembers.Dtos;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Queries.GetTenantMemberByIdQuery;

public class GetTenantMemberByIdQueryHandler(IUnitOfWork unitOfWork, ITenantContextService tenantContext)
    : IRequestHandler<GetTenantMemberByIdQuery, ApiResponse<TenantMemberDto>>
{
    public async Task<ApiResponse<TenantMemberDto>> Handle(
        GetTenantMemberByIdQuery request,
        CancellationToken cancellationToken)
    {
        if (!tenantContext.TenantId.HasValue)
        {
            throw new UnauthorizedException("Tenant context is missing or unauthenticated.");
        }

        var tenantId = tenantContext.TenantId.Value;

        var tm = await unitOfWork.TenantMemberRepository.Query()
            .Include(m => m.RoleAssignments)
            .ThenInclude(ra => ra.Role)
            .FirstOrDefaultAsync(m => m.Id == request.Id && m.TenantId == tenantId && !m.IsDeleted, cancellationToken)
            ?? throw new NotFoundException("Tenant member not found.");

        var dto = new TenantMemberDto
        {
            Id = tm.Id,
            TenantId = tm.TenantId,
            UserId = tm.UserId,
            ExternalIdentityId = tm.ExternalIdentityId,
            Email = tm.Email,
            FirstName = tm.FirstName,
            LastName = tm.LastName,
            Role = tm.RoleAssignments.Select(ra => ra.Role.Name).FirstOrDefault(),
            Roles = tm.RoleAssignments.Select(ra => ra.Role.Name).ToList(),
            RoleIds = tm.RoleAssignments.Select(ra => ra.RoleId).ToList(),
            Status = tm.Status.ToString(),
            ConcurrencyStamp = tm.ConcurrencyStamp,
            InvitationExpiresAtUtc = tm.InvitationExpiresAtUtc
        };

        return ApiResponse<TenantMemberDto>.Success(dto, "Tenant member retrieved successfully.");
    }
}
