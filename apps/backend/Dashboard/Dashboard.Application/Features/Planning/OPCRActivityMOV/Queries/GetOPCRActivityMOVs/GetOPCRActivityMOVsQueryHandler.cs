using ERPEZ.Application.Features.Planning.OPCRActivityMOV.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.OPCRActivityMOV.Queries.GetOPCRActivityMOVs;

public class GetOPCRActivityMOVsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetOPCRActivityMOVsQuery, PaginatedApiResponse<OPCRActivityMOVResponse>>
{
    public async Task<PaginatedApiResponse<OPCRActivityMOVResponse>> Handle(
        GetOPCRActivityMOVsQuery query,
        CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.OPCRActivityMOV, OPCRActivityMOVResponse>> projection = m => new OPCRActivityMOVResponse
        {
            Id = m.Id,
            OPCRActivityId = m.OPCRActivityId,
            FileName = m.FileName,
            Url = m.Url,
            UploadedDate = m.UploadedDate,
            CreatedAt = m.CreatedAt,
            CreatedBy = m.CreatedBy
        };

        var (movs, totalCount) = await unitOfWork.OPCRActivityMOVRepository.GetAllAsync(
            sieveModel,
            projection,
            cancellationToken: cancellationToken);

        return new PaginatedApiResponse<OPCRActivityMOVResponse>(
            [.. movs],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
