using ERPEZ.Application.Features.Planning.OfficeType.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.OfficeType.Queries.GetOfficeTypeById;

public record GetOfficeTypeByIdQuery(Guid Id) : IRequest<ApiResponse<OfficeTypeResponse>>;
