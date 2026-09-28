using System;
using System.Text.Json.Serialization;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Contracts.Commands.ReturnContract;

public record ReturnContractCommand : IRequest<ApiResponse<bool>>
{
    [JsonIgnore]
    public Guid Id { get; init; }
    public string Remarks { get; init; } = string.Empty;

    public ReturnContractCommand() { }
    public ReturnContractCommand(Guid id, string remarks)
    {
        Id = id;
        Remarks = remarks;
    }
}
