using System;
using ERPEZ.Application.Features.Procurement.Contracts.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Contracts.Queries.GetContractById;

public record GetContractByIdQuery(Guid Id) : IRequest<ApiResponse<ContractDetailDto>>;
