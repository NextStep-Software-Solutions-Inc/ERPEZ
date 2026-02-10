using ERPEZ.Application.Features.Planning.AdministrativeLevel.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.AdministrativeLevel.Queries.GetAdministrativeLevelById;

public record GetAdministrativeLevelByIdQuery(Guid Id) : IRequest<ApiResponse<AdministrativeLevelResponse>>;
