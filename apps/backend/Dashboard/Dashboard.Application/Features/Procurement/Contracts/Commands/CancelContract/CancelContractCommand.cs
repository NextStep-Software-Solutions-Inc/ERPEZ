using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Contracts.Commands.CancelContract;

public record CancelContractCommand(Guid Id) : IRequest<ApiResponse<bool>>;
