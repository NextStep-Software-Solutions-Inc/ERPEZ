using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using ERPEZ.TenantManagement.Application.Features.TenantSettings.Commands.UpdateTenantSetting;
using ERPEZ.TenantManagement.Domain.Entities;
using ERPEZ.TenantManagement.Domain.Interfaces;
using MediatR;

namespace ERPEZ.TenantManagement.Application.Features.TenantMembers.Commands.UpdateTenantMember;

public class UpdateTenantMemberCommandHandler(IUnitOfWork _unitOfWork)
    : IRequestHandler<UpdateTenantMemberCommand, ApiResponse<TenantMember>>
{
    public async Task<ApiResponse<TenantMember>> Handle(UpdateTenantMemberCommand request, CancellationToken cancellationToken)
    {
        if (request?.UpdateTenantMember == null) throw new NotFoundException("Update tenant member cannot be null.");

        var dto = request.UpdateTenantMember;
        if (dto.TenantId != null && dto.TenantId.HasValue)
        {
            var existTenant = await _unitOfWork.TenantRepository.GetByIdAsync(dto.TenantId.Value, cancellationToken: cancellationToken) ?? throw new NotFoundException("Tenant cannot be found.");
        }
        var tenantMember = await _unitOfWork.TenantMemberRepository
            .FindAsync(ts => ts.Id == request.Id && ts.TenantId == dto.TenantId, cancellationToken: cancellationToken) ?? throw new NotFoundException("Tenant member not found");

        var duplicate = await _unitOfWork.TenantMemberRepository
            .FindAsync(tm => tm.UserId == dto.UserId && tm.Role == dto.Role && tm.TenantId == dto.TenantId && tm.Id != request.Id, cancellationToken: cancellationToken);

        if (duplicate != null) throw new ConflictException("Another tenant member with the same name already exist.");
        
        tenantMember.TenantId = dto?.TenantId ?? tenantMember.TenantId;
        tenantMember.UserId = dto?.UserId ?? tenantMember.UserId;
        tenantMember.Role = dto?.Role ??tenantMember.Role;
        tenantMember.Status = dto?.Status ?? tenantMember.Status;

        _unitOfWork.TenantMemberRepository.Update(tenantMember);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<TenantMember>.Success(tenantMember, "Tenant member updated successfully.");
    }
}

