using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SalaryGrade.Commands.UpdateSalaryGrade;

public class UpdateSalaryGradeCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateSalaryGradeCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(UpdateSalaryGradeCommand request, CancellationToken cancellationToken)
    {
        var salaryGrade = await unitOfWork.SalaryGradeRepository.GetByIdAsync(request.Id, cancellationToken);

        if (salaryGrade == null)
            throw new NotFoundException($"Salary Grade with ID '{request.Id}' not found.");

        if (!string.IsNullOrWhiteSpace(request.UpdateSalaryGrade.Code) && request.UpdateSalaryGrade.Code != salaryGrade.Code)
        {
            var existingSalaryGrade = await unitOfWork.SalaryGradeRepository.FindAsync(
                x => x.Code == request.UpdateSalaryGrade.Code && x.Id != request.Id,
                cancellationToken
            );

            if (existingSalaryGrade != null)
                throw new ConflictException($"A Salary Grade with Code '{request.UpdateSalaryGrade.Code}' already exists.");

            salaryGrade.Code = request.UpdateSalaryGrade.Code;
        }

        if (!string.IsNullOrWhiteSpace(request.UpdateSalaryGrade.Name))
            salaryGrade.Name = request.UpdateSalaryGrade.Name;

        if (request.UpdateSalaryGrade.GradeNumber.HasValue)
            salaryGrade.GradeNumber = request.UpdateSalaryGrade.GradeNumber.Value;

        if (request.UpdateSalaryGrade.StepIncrementAmount.HasValue)
            salaryGrade.StepIncrementAmount = request.UpdateSalaryGrade.StepIncrementAmount.Value;

        if (request.UpdateSalaryGrade.NumberOfSteps.HasValue)
            salaryGrade.NumberOfSteps = request.UpdateSalaryGrade.NumberOfSteps.Value;

        if (request.UpdateSalaryGrade.EffectiveDate.HasValue)
            salaryGrade.EffectiveDate = request.UpdateSalaryGrade.EffectiveDate.Value;

        if (request.UpdateSalaryGrade.Description != null)
            salaryGrade.Description = request.UpdateSalaryGrade.Description;

        if (request.UpdateSalaryGrade.IsActive.HasValue)
            salaryGrade.IsActive = request.UpdateSalaryGrade.IsActive.Value;

        unitOfWork.SalaryGradeRepository.Update(salaryGrade);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Salary Grade updated successfully.");
    }
}

