using ERPEZ.Application.Features.Planning.Organization.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Organization.Commands.CreateOrganization;

public class CreateOrganizationCommandHandler(IUnitOfWork unitOfWork) : IRequestHandler<CreateOrganizationCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateOrganizationCommand request, CancellationToken cancellationToken)
    {
        if (request.FiscalYearId.HasValue)
        {
            _ = await unitOfWork.FiscalYearRepository.GetByIdAsync(request.FiscalYearId.Value, cancellationToken) ?? throw new NotFoundException($"Fiscal Year with the specified ID ({request.FiscalYearId.Value}) does not exist.");
        }

        var organizationExist = await unitOfWork.OrganizationRepository.FindAsync(t => t.Name == request.Name && t.FiscalYearId == request.FiscalYearId, cancellationToken: cancellationToken);
        if (organizationExist != null) throw new ConflictException("Organization already exists.");
        var organization = new Domain.Entities.Planning.Organization
        {
            ParentId = request.ParentId,
            Name = request.Name,
            Code = request.Code,
            Type = request.Type,
            IsActive = request.IsActive,
            FiscalYearId = request.FiscalYearId
        };
        await unitOfWork.OrganizationRepository.AddAsync(organization, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ApiResponse<Guid>.Success(organization.Id, "Organization created successfully.");
    }
}
