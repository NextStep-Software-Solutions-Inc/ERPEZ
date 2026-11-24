using ERPEZ.Application.Features.Planning.Organization.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Organization.Queries.GetOrganizationById;

public class GetFundSourceByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOrganizationByIdQuery, ApiResponse<OrganizationResponse>>
{
    public async Task<ApiResponse<OrganizationResponse>> Handle(GetOrganizationByIdQuery request, CancellationToken cancellationToken)
    {
        var organization = await unitOfWork.OrganizationRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        var response = new OrganizationResponse
        {
            Id = organization.Id,
            ParentId = organization.ParentId,
            Name = organization.Name,
            Code = organization.Code,
            Type = organization.Type,
            IsActive = organization.IsActive,
            FiscalYearId = organization.FiscalYearId
        };

        return ApiResponse<OrganizationResponse>.Success(response, "Retrieved successfully");
    }
}
