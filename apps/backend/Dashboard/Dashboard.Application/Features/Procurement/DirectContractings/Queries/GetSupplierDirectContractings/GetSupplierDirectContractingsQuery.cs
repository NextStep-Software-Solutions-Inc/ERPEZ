using System;
using System.Collections.Generic;
using ERPEZ.Application.Features.Procurement.DirectContractings.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Queries.GetSupplierDirectContractings;

public record GetSupplierDirectContractingsQuery(Guid SupplierId) : IRequest<ApiResponse<List<DirectContractingResponse>>>;
