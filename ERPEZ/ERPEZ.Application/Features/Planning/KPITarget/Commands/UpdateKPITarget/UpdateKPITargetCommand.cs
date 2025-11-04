using ERPEZ.Application.Features.Planning.KPITarget.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Planning.KPITarget.Commands.UpdateKPITarget;

public class UpdateKPITargetCommand : IRequest<ApiResponse<Domain.Entities.Planning.KPITarget>>
{
    public Guid Id { get; set; }
    public required UpdateKPITargetDto UpdateKPITarget { get; set; }
}
