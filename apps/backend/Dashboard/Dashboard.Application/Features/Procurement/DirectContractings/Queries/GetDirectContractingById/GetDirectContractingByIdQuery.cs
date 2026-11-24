using System;
using ERPEZ.Application.Features.Procurement.DirectContractings.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Queries.GetDirectContractingById;

public record GetDirectContractingByIdQuery(Guid Id) : IRequest<ApiResponse<DirectContractingResponse>>
{
}
