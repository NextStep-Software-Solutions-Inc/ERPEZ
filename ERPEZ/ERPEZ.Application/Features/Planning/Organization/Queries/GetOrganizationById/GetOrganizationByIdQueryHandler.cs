using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Organization.Queries.GetOrganizationById;

public class GetFundSourceByIdQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetOrganizationByIdQuery, ApiResponse<Domain.Entities.Planning.Organization>>
{
    public async Task<ApiResponse<Domain.Entities.Planning.Organization>> Handle(GetOrganizationByIdQuery request, CancellationToken cancellationToken)
    {
        var organization = await unitOfWork.OrganizationRepository.FindAsync(
           t => t.Id == request.Id,
            cancellationToken: cancellationToken) ?? throw new NotFoundException("No data found.");

        return ApiResponse<Domain.Entities.Planning.Organization>.Success(organization, "Retrieved successfully");
    }
}
