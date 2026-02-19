using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SalaryGrade.Commands.CreateSalaryGrade;

public class CreateSalaryGradeCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<CreateSalaryGradeCommand, ApiResponse<Guid>>
{
    public async Task<ApiResponse<Guid>> Handle(CreateSalaryGradeCommand request, CancellationToken cancellationToken)
    {
        var existingSalaryGrade = await unitOfWork.SalaryGradeRepository.FindAsync(
            x => x.Code == request.Code,
            cancellationToken
        );

        if (existingSalaryGrade != null)
            throw new ConflictException($"A Salary Grade with Code '{request.Code}' already exists.");

        var existingGradeNumber = await unitOfWork.SalaryGradeRepository.FindAsync(
            x => x.GradeNumber == request.GradeNumber,
            cancellationToken
        );

        if (existingGradeNumber != null)
            throw new ConflictException($"A Salary Grade with Grade Number '{request.GradeNumber}' already exists.");

        var salaryGrade = new Domain.Entities.Planning.SalaryGrade
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Code = request.Code,
            GradeNumber = request.GradeNumber,
            StepIncrementAmount = request.StepIncrementAmount,
            NumberOfSteps = request.NumberOfSteps,
            EffectiveDate = request.EffectiveDate,
            Description = request.Description,
            IsActive = true
        };

        await unitOfWork.SalaryGradeRepository.AddAsync(salaryGrade, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Guid>.Success(salaryGrade.Id, "Salary Grade created successfully.");
    }
}
