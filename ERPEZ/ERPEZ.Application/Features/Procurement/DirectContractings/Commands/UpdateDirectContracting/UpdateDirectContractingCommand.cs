using System;
using ERPEZ.Application.Features.Procurement.DirectContractings.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.UpdateDirectContracting;

public record UpdateDirectContractingCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public required UpdateDirectContractingRequest Request { get; init; }
}
