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
        Expression<Func<Domain.Entities.Planning.UNSPSCCode, UNSPSCCodeResponse>> projection = x => new UNSPSCCodeResponse
        {
            Id = x.Id,
            Code = x.Code,
            Name = x.Name,
            Level = x.Level,
            ParentId = x.ParentId,
            ParentName = x.Parent != null ? x.Parent.Name : null,
            CreatedAt = x.CreatedAt,
            UpdatedAt = x.UpdatedAt
        };

        var (codes, totalCount) = await unitOfWork.UNSPSCCodeRepository.GetAllAsync(
            request.SieveModel,
            projection,
            cancellationToken: cancellationToken);

        return new PaginatedApiResponse<UNSPSCCodeResponse>(
            [.. codes],
            request.SieveModel.Page ?? 1,
            request.SieveModel.PageSize ?? 10,
            totalCount);
    }
}
