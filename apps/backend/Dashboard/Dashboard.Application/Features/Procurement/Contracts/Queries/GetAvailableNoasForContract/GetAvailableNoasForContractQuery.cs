using System.Collections.Generic;
using ERPEZ.Application.Features.Procurement.Contracts.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Contracts.Queries.GetAvailableNoasForContract;

public record GetAvailableNoasForContractQuery : IRequest<ApiResponse<List<AvailableNoaForContractDto>>>;
