using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Organization.Commands.UpdateOrganization;

public class UpdateOrganizationCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateOrganizationCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateOrganizationCommand request, CancellationToken cancellationToken)
    {
        var dto = request.UpdateOrganization;

        if (dto.FiscalYearId.HasValue)
        {
            _ = await unitOfWork.FiscalYearRepository.GetByIdAsync(dto.FiscalYearId.Value, cancellationToken) ?? throw new NotFoundException($"Fiscal Year with the specified ID ({dto.FiscalYearId.Value}) does not exist.");
        }

        var organization = await unitOfWork.OrganizationRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Organization not found.");
        
        var effectiveName = dto.Name ?? organization.Name;
        var effectiveFiscalYearId = dto.FiscalYearId ?? organization.FiscalYearId;
        var isNameChanged = dto.Name != null;
        var isFiscalYearChanged = dto.FiscalYearId.HasValue && dto.FiscalYearId.Value != organization.FiscalYearId;

        // Check for duplicate name in the fiscal year that will be persisted (excluding current organization)
        if (isNameChanged || isFiscalYearChanged)
        {
            var existingOrganization = await unitOfWork.OrganizationRepository.FindAsync(o => o.Name == effectiveName && o.Id != request.Id && o.FiscalYearId == effectiveFiscalYearId,
                cancellationToken);
            if (existingOrganization != null)
                throw new ConflictException("Organization already exist.");
        }

        organization.ParentId = dto?.ParentId ?? organization.ParentId;
        organization.Name = dto?.Name ?? organization.Name;
        organization.Code = dto?.Code ?? organization.Code;
        organization.Type = dto?.Type ?? organization.Type;
        organization.IsActive = dto?.IsActive ?? organization.IsActive;
        organization.FiscalYearId = dto?.FiscalYearId ?? organization.FiscalYearId;


        unitOfWork.OrganizationRepository.Update(organization);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Organization updated successfully.");
    }
}
