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

        if (!string.IsNullOrWhiteSpace(request.Request.Code) && request.Request.Code != salaryGrade.Code)
        {
            var existingSalaryGrade = await unitOfWork.SalaryGradeRepository.FindAsync(
                x => x.Code == request.Request.Code && x.Id != request.Id,
                cancellationToken
            );

            if (existingSalaryGrade != null)
                throw new ConflictException($"A Salary Grade with Code '{request.Request.Code}' already exists.");

            salaryGrade.Code = request.Request.Code;
        }

        if (!string.IsNullOrWhiteSpace(request.Request.Name))
            salaryGrade.Name = request.Request.Name;

        if (request.Request.GradeNumber.HasValue)
            salaryGrade.GradeNumber = request.Request.GradeNumber.Value;

        if (request.Request.StepIncrementAmount.HasValue)
            salaryGrade.StepIncrementAmount = request.Request.StepIncrementAmount.Value;

        if (request.Request.NumberOfSteps.HasValue)
            salaryGrade.NumberOfSteps = request.Request.NumberOfSteps.Value;

        if (request.Request.EffectiveDate.HasValue)
            salaryGrade.EffectiveDate = request.Request.EffectiveDate.Value;

        if (request.Request.Description != null)
            salaryGrade.Description = request.Request.Description;

        if (request.Request.IsActive.HasValue)
            salaryGrade.IsActive = request.Request.IsActive.Value;

        unitOfWork.SalaryGradeRepository.Update(salaryGrade);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Salary Grade updated successfully.");
    }
}
