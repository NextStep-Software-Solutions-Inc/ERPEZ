using ERPEZ.Application.Features.Planning.UACSCodeSegment.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.UACSCodeSegment.Queries.GetUACSCodeSegments;

public class GetUACSCodeSegmentsQueryHandler(IUnitOfWork unitOfWork) 
    : IRequestHandler<GetUACSCodeSegmentsQuery, PaginatedApiResponse<UACSCodeSegmentResponse>>
{
    public async Task<PaginatedApiResponse<UACSCodeSegmentResponse>> Handle(GetUACSCodeSegmentsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.UACSCodeSegment, UACSCodeSegmentResponse>> projection = codeSegment => new UACSCodeSegmentResponse
        {
            Id = codeSegment.Id,
            SegmentType = codeSegment.SegmentType,
            Name = codeSegment.Name,
            Description = codeSegment.Description,
            DisplayOrder = codeSegment.DisplayOrder,
            IsRequired = codeSegment.IsRequired,
            MaxLength = codeSegment.MaxLength,
            Pattern = codeSegment.Pattern,
            IsActive = codeSegment.IsActive,
            CreatedBy = codeSegment.CreatedBy,
            CreatedAt = codeSegment.CreatedAt
        };

        var (codeSegments, totalCount) = await unitOfWork.UACSCodeSegmentRepository.GetAllAsync(sieveModel, projection, cancellationToken: cancellationToken);
        return new PaginatedApiResponse<UACSCodeSegmentResponse>(
            [.. codeSegments],
            query.PageNumber,
            query.PageSize,
            totalCount);
    }
}
