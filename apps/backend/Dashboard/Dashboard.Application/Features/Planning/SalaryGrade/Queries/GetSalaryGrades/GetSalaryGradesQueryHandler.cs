using ERPEZ.Application.Features.Planning.SalaryGrade.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;
using System.Linq.Expressions;

namespace ERPEZ.Application.Features.Planning.SalaryGrade.Queries.GetSalaryGrades;

public class GetSalaryGradesQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetSalaryGradesQuery, PaginatedApiResponse<SalaryGradeResponse>>
{
    public async Task<PaginatedApiResponse<SalaryGradeResponse>> Handle(GetSalaryGradesQuery query, CancellationToken cancellationToken)
    {
        var sieveModel = new Sieve.Models.SieveModel
        {
            PageSize = query.PageSize,
            Page = query.PageNumber,
            Filters = query.Filters,
            Sorts = query.Sorts ?? "GradeNumber"
        };

        Expression<Func<Domain.Entities.Planning.SalaryGrade, SalaryGradeResponse>> projection = sg => new SalaryGradeResponse
        {
            Id = sg.Id,
            Name = sg.Name,
            Code = sg.Code,
            GradeNumber = sg.GradeNumber,
            StepIncrementAmount = sg.StepIncrementAmount,
            NumberOfSteps = sg.NumberOfSteps,
            EffectiveDate = sg.EffectiveDate,
            Description = sg.Description,
            IsActive = sg.IsActive,
            CreatedAt = sg.CreatedAt
        };

        var (salaryGrades, totalCount) = await unitOfWork.SalaryGradeRepository.GetAllAsync(
            sieveModel,
            projection,
            cancellationToken: cancellationToken);

        return new PaginatedApiResponse<SalaryGradeResponse>(
            [.. salaryGrades],
            query.PageNumber,
            query.PageSize,
            totalCount
        );
    }
}
