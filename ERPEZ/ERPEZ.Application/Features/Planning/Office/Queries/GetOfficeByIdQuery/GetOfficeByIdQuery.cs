using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Office.Queries.GetOfficeByIdQuery;

public record GetOfficeByIdQuery(Guid Id) : IRequest<ApiResponse<Domain.Entities.Planning.Office>>;