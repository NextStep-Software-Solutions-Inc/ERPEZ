using ERPEZ.Application.Features.Planning.ObjectChildCode.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ObjectChildCode.Queries.GetAncestors;

public class GetAncestorsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetAncestorsQuery, ApiResponse<List<ObjectChildCodeResponse>>>
{
    public async Task<ApiResponse<List<ObjectChildCodeResponse>>> Handle(GetAncestorsQuery request, CancellationToken cancellationToken)
    {
        var ancestors = await unitOfWork.ObjectChildCodeRepository.GetAncestorsAsync(request.ObjectId, cancellationToken);

        var response = ancestors.Select(a => new ObjectChildCodeResponse
        {
            Id = a.Id,
            ParentObjectId = a.ParentObjectId,
            ChildObjectId = a.ChildObjectId,
            Name = a.Name,
            Code = a.Code,
            Description = a.Description,
            AgencyId = a.AgencyId,
            IsActive = a.IsActive
        }).ToList();

        return ApiResponse<List<ObjectChildCodeResponse>>.Success(response, "Ancestors retrieved successfully.");
    }
}
