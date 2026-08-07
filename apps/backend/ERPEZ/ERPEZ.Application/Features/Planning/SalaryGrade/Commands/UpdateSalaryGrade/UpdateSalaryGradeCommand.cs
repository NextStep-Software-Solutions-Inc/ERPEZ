using ERPEZ.Application.Features.Planning.SalaryGrade.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SalaryGrade.Commands.UpdateSalaryGrade;

public record UpdateSalaryGradeCommand : IRequest<ApiResponse<Unit>>
{
    public required Guid Id { get; init; }
    public required UpdateSalaryGradeRequest UpdateSalaryGrade { get; init; }
}
