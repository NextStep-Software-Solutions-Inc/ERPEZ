using ERPEZ.Application.Features.Planning.ObjectChildCode.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ObjectChildCode.Queries.GetDescendants;

public class GetDescendantsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetDescendantsQuery, ApiResponse<List<ObjectChildCodeResponse>>>
{
    public async Task<ApiResponse<List<ObjectChildCodeResponse>>> Handle(GetDescendantsQuery request, CancellationToken cancellationToken)
    {
        var descendants = await unitOfWork.ObjectChildCodeRepository.GetDescendantsAsync(request.ObjectId, cancellationToken);

        var response = descendants.Select(d => new ObjectChildCodeResponse
        {
            Id = d.Id,
            ParentObjectId = d.ParentObjectId,
            ChildObjectId = d.ChildObjectId,
            Name = d.Name,
            Code = d.Code,
            Description = d.Description,
            AgencyId = d.AgencyId,
            IsActive = d.IsActive
        }).ToList();

        return ApiResponse<List<ObjectChildCodeResponse>>.Success(response, "Descendants retrieved successfully.");
    }
}
