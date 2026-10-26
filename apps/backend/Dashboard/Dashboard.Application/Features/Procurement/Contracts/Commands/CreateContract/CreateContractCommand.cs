using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Contracts.Commands.CreateContract;

public record CreateContractCommand : IRequest<ApiResponse<Guid>>
{
    public Guid NoticeOfAwardId { get; init; }
    public string? ContractNumber { get; init; }
    public DateOnly ContractDate { get; init; }
    public string Description { get; init; } = string.Empty;
}

