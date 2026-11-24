using ERPEZ.Application.Features.Planning.Psdbm.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.Psdbm.Commands.TriggerSync;

public record TriggerPsdbmSyncCommand : IRequest<ApiResponse<PsdbmSyncResultDto>>
{
    public PsdbmSyncRequestDto Request { get; init; } = new();
}
