using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Contracts.Commands.DeleteContract;

public record DeleteContractCommand(Guid Id) : IRequest<ApiResponse<bool>>;
