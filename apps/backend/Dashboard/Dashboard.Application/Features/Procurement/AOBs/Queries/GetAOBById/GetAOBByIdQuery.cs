using ERPEZ.Application.Features.Procurement.AOBs.Dtos;
using ERPEZ.Shared.Common;
using MediatR;
using System;

namespace ERPEZ.Application.Features.Procurement.AOBs.Queries.GetAOBById;

public record GetAOBByIdQuery(Guid Id) : IRequest<ApiResponse<AOBDetailResponse>>;
