using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.DeleteDirectContracting;

public record DeleteDirectContractingCommand(Guid Id) : IRequest<ApiResponse<Unit>>
{
}
