using System;
using System.Text.Json.Serialization;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Contracts.Commands.ApproveContract;

public record ApproveContractCommand : IRequest<ApiResponse<bool>>
{
    [JsonIgnore]
    public Guid Id { get; init; }
    public string? Remarks { get; init; }

    public ApproveContractCommand() { }
    public ApproveContractCommand(Guid id, string? remarks = null)
    {
        Id = id;
        Remarks = remarks;
    }
}
