using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SalaryGrade.Commands.DeleteSalaryGrade;

public record DeleteSalaryGradeCommand(Guid Id) : IRequest<ApiResponse<Unit>>;
