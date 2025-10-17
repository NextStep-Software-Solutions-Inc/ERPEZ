using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.TenantManagement.Application.Features.TenantMembers.Dtos;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.CreateTenantMember;

public class CreateTenantMemberCommandHandler(IUnitOfWork _unitOfWork)
    : IRequestHandler<CreateTenantMemberCommand, ApiResponse<TenantMemberDto>>
{
    public async Task<ApiResponse<TenantMemberDto>> Handle(CreateTenantMemberCommand command, CancellationToken cancellationToken)
    {
        var tenantMemberExist = await _unitOfWork.TenantMemberRepository
            .FindAsync(tm => tm.TenantId == command.TenantId && tm.UserId == command.UserId, cancellationToken);

        if (tenantMemberExist != null)
            throw new ConflictException("Tenant member already exists.");

        // Check if the tenant exists before creating the member
        var tenantExists = await _unitOfWork.TenantRepository
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

        // Map the saved entity to the DTO to break the circular reference and match the return type.
        var tenantMemberDto = new TenantMemberDto
        {
            Id = tenantMember.Id,
            TenantId = tenantMember.TenantId,
            UserId = tenantMember.UserId,
            Role = tenantMember.Role,
            Status = tenantMember.Status
        };

        return ApiResponse<TenantMemberDto>.Success(tenantMemberDto, "Tenant member created successfully.");
    }
}
