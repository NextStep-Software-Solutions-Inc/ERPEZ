using ERPEZ.Application.Features.Planning.ProcurementCategory.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.ProcurementCategory.Queries.GetProcurementCategoryById;

public record GetProcurementCategoryByIdQuery(Guid Id) : IRequest<ApiResponse<ProcurementCategoryResponse>>;
