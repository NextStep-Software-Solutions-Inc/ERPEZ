using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
using ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.OfficeCeiling.Queries.GetOfficeCeilingById;

public record GetOfficeCeilingByIdQuery(Guid Id) : IRequest<ApiResponse<OfficeCeilingResponse>>;

