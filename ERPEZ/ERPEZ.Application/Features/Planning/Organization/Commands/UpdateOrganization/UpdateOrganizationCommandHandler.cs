using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Organization.Commands.UpdateOrganization;

public class UpdateOrganizationCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<UpdateOrganizationCommand, ApiResponse<Domain.Entities.Planning.Organization>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.Organization>> Handle(UpdateOrganizationCommand request, CancellationToken cancellationToken)
    {
        var organization = await unitOfWork.OrganizationRepository.GetByIdAsync(request.Id, cancellationToken: cancellationToken) ?? throw new NotFoundException("Organization not found.");
        if (organization.Name == request.UpdateOrganization?.Name) throw new ConflictException("Organization already exist.");

        var dto = request.UpdateOrganization;
        organization.ParentId = dto?.ParentId ?? organization.ParentId;
        organization.Name = dto?.Name ?? organization.Name;
        organization.Code = dto?.Code ?? organization.Code;
        organization.Type = dto?.Type ?? organization.Type;
        organization.IsActive = dto?.IsActive ?? organization.IsActive;


        unitOfWork.OrganizationRepository.Update(organization);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Domain.Entities.Planning.Organization>.Success(organization, "Organization updated successfully.");
    }
}
