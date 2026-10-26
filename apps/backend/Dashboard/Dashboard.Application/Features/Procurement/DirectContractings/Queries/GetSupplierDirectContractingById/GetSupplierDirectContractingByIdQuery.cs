using System;
using ERPEZ.Application.Features.Procurement.DirectContractings.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Queries.GetSupplierDirectContractingById;

public record GetSupplierDirectContractingByIdQuery(Guid Id, Guid SupplierId) : IRequest<ApiResponse<DirectContractingResponse>>;
