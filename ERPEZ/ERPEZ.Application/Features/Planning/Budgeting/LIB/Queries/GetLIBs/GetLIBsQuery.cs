using ERPEZ.Application.Features.Planning.Budgeting.Common;
using ERPEZ.Application.Features.Planning.Budgeting.Common.Enums;
using ERPEZ.Application.Features.Planning.Budgeting.LIB.Dtos;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Budgeting.LIB.Queries.GetLIBs;

public record GetLIBsQuery : IRequest<ApiResponse<List<LIBResponse>>>;

