using ERPEZ.Application.Features.Planning.Step.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.Step.Queries.GetSteps;

public class GetStepsQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetStepsQuery, PaginatedApiResponse<StepResponse>>
{
    public async Task<PaginatedApiResponse<StepResponse>> Handle(GetStepsQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts
        };

        Expression<Func<Domain.Entities.Planning.Step, StepResponse>> projection = s => new StepResponse
        {
            Id = s.Id,
            Name = s.Name,
            Code = s.Code,
            StepNumber = s.StepNumber,
            MinStep = s.MinStep,
            MaxStep = s.MaxStep,
            Description = s.Description,
            IsActive = s.IsActive,
            CreatedAt = s.CreatedAt
        };

        var (steps, totalCount) = await unitOfWork.StepRepository.GetAllAsync(
            sieveModel,
            projection,
            cancellationToken: cancellationToken);

        return new PaginatedApiResponse<StepResponse>(
            [.. steps],
            query.PageNumber,
            query.PageSize,
            totalCount
        );
    }
}
