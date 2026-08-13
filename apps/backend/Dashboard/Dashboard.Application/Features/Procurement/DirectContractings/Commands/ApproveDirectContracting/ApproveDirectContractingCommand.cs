using ERPEZ.Shared.Common;
using MediatR;
using System;

namespace ERPEZ.Application.Features.Procurement.DirectContractings.Commands.ApproveDirectContracting;

public record ApproveDirectContractingCommand : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; init; }
    public ApproveDirectContractingRequest Request { get; init; } = null!;
}

public record ApproveDirectContractingRequest
{
    public Guid AttachmentFileId { get; init; }
}
