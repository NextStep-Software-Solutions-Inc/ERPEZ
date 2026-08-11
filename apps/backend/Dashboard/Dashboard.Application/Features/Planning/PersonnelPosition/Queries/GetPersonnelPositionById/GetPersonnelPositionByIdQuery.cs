using ERPEZ.Application.Features.Planning.PersonnelPosition.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.PersonnelPosition.Queries.GetPersonnelPositionById;

public record GetPersonnelPositionByIdQuery(Guid Id) : IRequest<ApiResponse<PersonnelPositionResponse>>;
