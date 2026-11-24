using ERPEZ.Application.Features.Planning.SalaryGrade.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SalaryGrade.Queries.GetSalaryGradeById;

public class GetSalaryGradeByIdQueryHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<GetSalaryGradeByIdQuery, ApiResponse<SalaryGradeResponse>>
{
    public async Task<ApiResponse<SalaryGradeResponse>> Handle(GetSalaryGradeByIdQuery request, CancellationToken cancellationToken)
    {
        var salaryGrade = await unitOfWork.SalaryGradeRepository.GetByIdAsync(request.Id, cancellationToken);

        if (salaryGrade == null)
            throw new NotFoundException($"Salary Grade with ID '{request.Id}' not found.");

        var response = new SalaryGradeResponse
        {
            Id = salaryGrade.Id,
            Name = salaryGrade.Name,
            Code = salaryGrade.Code,
            GradeNumber = salaryGrade.GradeNumber,
            StepIncrementAmount = salaryGrade.StepIncrementAmount,
            NumberOfSteps = salaryGrade.NumberOfSteps,
            EffectiveDate = salaryGrade.EffectiveDate,
            Description = salaryGrade.Description,
            IsActive = salaryGrade.IsActive,
            CreatedAt = salaryGrade.CreatedAt
        };

        return ApiResponse<SalaryGradeResponse>.Success(response);
    }
}
