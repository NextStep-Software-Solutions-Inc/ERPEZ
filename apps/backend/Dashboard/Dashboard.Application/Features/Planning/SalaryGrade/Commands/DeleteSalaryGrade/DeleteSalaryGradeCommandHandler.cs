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

        // Check if linked to active positions
        var hasActivePositions = await unitOfWork.PositionRepository.FindAsync(
            x => x.SalaryGradeId == request.Id && !x.IsDeleted,
            cancellationToken
        );

        if (hasActivePositions != null)
            throw new ConflictException($"Cannot delete Salary Grade '{salaryGrade.Name}' because it is linked to active positions.");

        unitOfWork.SalaryGradeRepository.Remove(salaryGrade);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ApiResponse<Unit>.Success(Unit.Value, "Salary Grade deleted successfully.");
    }
}
