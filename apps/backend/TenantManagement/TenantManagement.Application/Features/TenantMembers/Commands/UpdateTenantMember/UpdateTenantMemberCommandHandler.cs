using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.UpdateTenantMember;

public class UpdateTenantMemberCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateTenantMemberCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(UpdateTenantMemberCommand request, CancellationToken cancellationToken)
    {
        if (request?.UpdateTenantMember == null) throw new NotFoundException("Update tenant member cannot be null.");

        var dto = request.UpdateTenantMember;
        if (dto.TenantId.HasValue)
        {
            _ = await unitOfWork.TenantRepository.GetByIdAsync(dto.TenantId.Value, cancellationToken: cancellationToken) ?? throw new NotFoundException("Tenant cannot be found.");
        }
        var tenantMember = await unitOfWork.TenantMemberRepository
            .FindAsync(ts => ts.Id == request.Id && ts.TenantId == dto.TenantId, cancellationToken: cancellationToken) ?? throw new NotFoundException("Tenant member not found");

        var duplicate = await unitOfWork.TenantMemberRepository
            .FindAsync(tm => tm.UserId == dto.UserId && tm.TenantId == dto.TenantId && tm.Id != request.Id, cancellationToken: cancellationToken);

        if (duplicate != null) throw new ConflictException("Another tenant member with the same UserId already exists for this tenant.");

        tenantMember.TenantId = dto?.TenantId ?? tenantMember.TenantId;
        tenantMember.UserId = dto?.UserId ?? tenantMember.UserId;
        if (!string.IsNullOrWhiteSpace(dto?.ExternalIdentityId))
        {
            tenantMember.ExternalIdentityId = dto.ExternalIdentityId;
        }
        tenantMember.Status = dto?.Status ?? tenantMember.Status;

        if (dto?.RoleIds != null)
        {
            tenantMember.RoleAssignments.Clear();
            foreach (var roleId in dto.RoleIds.Distinct())
            {
                tenantMember.RoleAssignments.Add(new TenantMemberRoleAssignment
                {
                    TenantMemberId = tenantMember.Id,
                    RoleId = roleId
                });
            }
        }

        unitOfWork.TenantMemberRepository.Update(tenantMember);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(tenantMember.Id, "Tenant member updated successfully.");
    }
}

