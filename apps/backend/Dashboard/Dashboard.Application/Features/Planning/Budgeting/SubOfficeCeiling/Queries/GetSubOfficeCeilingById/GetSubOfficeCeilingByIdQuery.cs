using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
using ERPEZ.Application.Features.Planning.Budgeting.SubOfficeCeiling.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using ERPEZ.Shared.Exceptions;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.SubOfficeCeiling.Queries.GetSubOfficeCeilingById;

public record GetSubOfficeCeilingByIdQuery(Guid Id) : IRequest<ApiResponse<SubOfficeCeilingResponse>>;

