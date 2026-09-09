using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.CreateTenantMember;

public class CreateTenantMemberCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateTenantMemberCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateTenantMemberCommand command, CancellationToken cancellationToken)
    {
        var tenantMemberExist = await unitOfWork.TenantMemberRepository
            .FindAsync(tm => tm.TenantId == command.TenantId && tm.UserId == command.UserId, cancellationToken);

        if (tenantMemberExist != null)
            throw new ConflictException("Tenant member already exists.");

        // Check if the tenant exists before creating the member
        _ = await unitOfWork.TenantRepository
            .FindAsync(t => t.Id == command.TenantId, cancellationToken) ?? throw new NotFoundException("Tenant not found.");

        var tenantMember = new TenantMember
        {
            TenantId = command.TenantId,
            UserId = command.UserId,
            ExternalIdentityId = !string.IsNullOrWhiteSpace(command.ExternalIdentityId) ? command.ExternalIdentityId : command.UserId,
            Email = command.Email,
            FirstName = command.FirstName,
            LastName = command.LastName,
            Status = command.Status
        };

        if (command.RoleIds != null && command.RoleIds.Count != 0)
        {
            foreach (var roleId in command.RoleIds.Distinct())
            {
                tenantMember.RoleAssignments.Add(new TenantMemberRoleAssignment
                {
                    RoleId = roleId
                });
            }
        }
        else
        {
            var endUserRole = await unitOfWork.RoleRepository.FindAsync(r => r.NormalizedName == "END USER", cancellationToken);
            if (endUserRole != null)
            {
                tenantMember.RoleAssignments.Add(new TenantMemberRoleAssignment
                {
                    RoleId = endUserRole.Id
                });
            }
        }

        await unitOfWork.TenantMemberRepository.AddAsync(tenantMember, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);



        return ApiResponse<Guid>.Success(tenantMember.Id, "Tenant member created successfully.");
    }
}
