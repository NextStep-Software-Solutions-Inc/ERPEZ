using System;
using System.Text.Json.Serialization;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Contracts.Commands.UpdateContract;

public record UpdateContractCommand : IRequest<ApiResponse<bool>>
{
    [JsonIgnore]
    public Guid Id { get; init; }

    public string? ContractNumber { get; init; }
    public DateOnly ContractDate { get; init; }
    public string Description { get; init; } = string.Empty;
}

