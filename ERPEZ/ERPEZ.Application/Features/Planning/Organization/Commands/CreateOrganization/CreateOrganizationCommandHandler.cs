using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Organization.Commands.CreateOrganization;

public class CreateFundSourceCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateOrganizationCommand, ApiResponse<Domain.Entities.Planning.Organization>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.Organization>> Handle(CreateOrganizationCommand request, CancellationToken cancellationToken)
    {
        var organizationExist = await unitOfWork.OrganizationRepository.FindAsync(t => t.Name == request.Name, cancellationToken: cancellationToken);
        if (organizationExist != null) throw new ConflictException("Organization already exists.");
        var organization = new Domain.Entities.Planning.Organization
        {
            ParentId = request.ParentId,
            Name = request.Name,
            Code = request.Code,
            Type = request.Type,
            IsActive = request.IsActive
        };
        await unitOfWork.OrganizationRepository.AddAsync(organization, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<Guid>.Success(organization.Id, "Organization created successfully.");
    }
}
