using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SalaryGrade.Commands.DeleteSalaryGrade;

public class DeleteSalaryGradeCommandHandler(IUnitOfWork unitOfWork)
    : IRequestHandler<DeleteSalaryGradeCommand, ApiResponse<Unit>>
{
    public async Task<ApiResponse<Unit>> Handle(DeleteSalaryGradeCommand request, CancellationToken cancellationToken)
    {
        var salaryGrade = await unitOfWork.SalaryGradeRepository.GetByIdAsync(request.Id, cancellationToken);

        if (salaryGrade == null)
            throw new NotFoundException($"Salary Grade with ID '{request.Id}' not found.");

        unitOfWork.SalaryGradeRepository.Remove(salaryGrade);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Salary Grade deleted successfully.");
    }
}
