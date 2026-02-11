using ERPEZ.Application.Features.Planning.Position.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.Position.Queries.GetPositions;

public class GetPositionsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetPositionsQuery, PaginatedApiResponse<PositionResponse>>
{
    public async Task<PaginatedApiResponse<PositionResponse>> Handle(GetPositionsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.Position, PositionResponse>> projection = p => new PositionResponse
        {
            Id = p.Id,
            Title = p.Title,
            FunctionalTitle = p.FunctionalTitle,
            Code = p.Code,
            JobDescription = p.JobDescription,
            Qualifications = p.Qualifications,
            FTE = p.FTE,
            OperationalStatus = p.OperationalStatus,
            PositionTypeId = p.PositionTypeId,
            PlantillaTypeId = p.PlantillaTypeId,
            SalaryGradeId = p.SalaryGradeId,
            StepId = p.StepId,
            OfficeId = p.OfficeId,
            CreatedAt = p.CreatedAt
        };

        var (positions, totalCount) = await unitOfWork.PositionRepository.GetAllAsync(
            sieveModel,
            projection,
            cancellationToken: cancellationToken);

        return new PaginatedApiResponse<PositionResponse>(
            [.. positions],
            query.PageNumber,
            query.PageSize,
            totalCount
        );
    }
}
