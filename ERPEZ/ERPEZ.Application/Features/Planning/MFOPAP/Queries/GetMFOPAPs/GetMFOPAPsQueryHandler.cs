using ERPEZ.Application.Features.Planning.MFOPAP.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using Sieve.Models;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.MFOPAP.Queries.GetMFOPAPs;

public class GetMFOPAPsQueryHandler(IUnitOfWork unitOfWork) : IRequestHandler<GetMFOPAPsQuery, PaginatedApiResponse<MFOPAPResponse>>
{
    public async Task<PaginatedApiResponse<MFOPAPResponse>> Handle(GetMFOPAPsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.MFOPAP, MFOPAPResponse>> projection = mfopap => new MFOPAPResponse
        {
            Id = mfopap.Id,
            ParentId = mfopap.ParentId,
            Name = mfopap.Name,
            Code = mfopap.Code,
            Type = mfopap.Type,
            IsActive = mfopap.IsActive
        };

        var (mfoPAPs, totalCount) = await unitOfWork.MFOPAPRepository.GetAllAsync(sieveModel, projection, cancellationToken);

        return new PaginatedApiResponse<MFOPAPResponse>(
            [.. mfoPAPs],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
