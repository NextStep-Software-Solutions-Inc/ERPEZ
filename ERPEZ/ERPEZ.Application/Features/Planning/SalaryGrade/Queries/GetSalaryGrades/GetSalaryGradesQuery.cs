using ERPEZ.Application.Common.Queries;
using ERPEZ.Application.Features.Planning.SalaryGrade.Dtos;
using ERPEZ.Shared.Common;

namespace ERPEZ.Application.Features.Planning.SalaryGrade.Queries.GetSalaryGrades;

public record GetSalaryGradesQuery : PaginatedQuery<PaginatedApiResponse<SalaryGradeResponse>>;
