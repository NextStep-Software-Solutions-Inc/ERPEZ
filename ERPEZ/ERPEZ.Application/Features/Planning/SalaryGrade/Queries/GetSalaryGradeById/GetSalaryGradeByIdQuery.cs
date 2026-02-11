using ERPEZ.Application.Features.Planning.SalaryGrade.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.SalaryGrade.Queries.GetSalaryGradeById;

public record GetSalaryGradeByIdQuery(Guid Id) : IRequest<ApiResponse<SalaryGradeResponse>>;
