using ERPEZ.Application.Features.Planning.UNSPSCCode.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.UNSPSCCode.Queries.GetUNSPSCCodes;

public class GetUNSPSCCodesQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetUNSPSCCodesQuery, PaginatedApiResponse<UNSPSCCodeResponse>>
{
    public async Task<PaginatedApiResponse<UNSPSCCodeResponse>> Handle(
        GetUNSPSCCodesQuery request,
        CancellationToken cancellationToken)
    {
        // Get codes with parent names using a join query to avoid navigation property serialization issues
        var codesWithParents = await unitOfWork.UNSPSCCodeRepository.GetAllWithParentNamesAsync(request.SieveModel, cancellationToken);

        return new PaginatedApiResponse<UNSPSCCodeResponse>(
            [.. codesWithParents.Entities.Select(x => new UNSPSCCodeResponse
            {
                Id = x.Id,
                Code = x.Code,
                Name = x.Name,
                Description = x.Description,
                Level = x.Level,
                IsActive = x.IsActive,
                ParentId = x.ParentId,
                ParentName = x.ParentName,
                Children = [], // Explicitly empty for flat list
                CreatedAt = x.CreatedAt,
                UpdatedAt = x.UpdatedAt
            })],
            request.SieveModel.Page ?? 1,
            request.SieveModel.PageSize ?? 10,
            codesWithParents.TotalCount);
    }
}
