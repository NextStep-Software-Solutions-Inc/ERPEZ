using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.CreateTenantMember;

public class CreateTenantMemberCommandHandler(IUnitOfWork _unitOfWork)
    : IRequestHandler<CreateTenantMemberCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateTenantMemberCommand command, CancellationToken cancellationToken)
    {
        var tenantMemberExist = await _unitOfWork.TenantMemberRepository
            .FindAsync(tm => tm.TenantId == command.TenantId && tm.UserId == command.UserId, cancellationToken);

        if (tenantMemberExist != null)
            throw new ConflictException("Tenant member already exists.");

        // Check if the tenant exists before creating the member
        _ = await _unitOfWork.TenantRepository
            .FindAsync(t => t.Id == command.TenantId, cancellationToken) ?? throw new NotFoundException("Tenant not found.");

        var tenantMember = new TenantMember
        {
            TenantId = command.TenantId,
            UserId = command.UserId,
            Role = command.Role,
            Status = command.Status
        };

        await _unitOfWork.TenantMemberRepository.AddAsync(tenantMember, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

      

        return ApiResponse<Guid>.Success(tenantMember.Id, "Tenant member created successfully.");
    }
}
