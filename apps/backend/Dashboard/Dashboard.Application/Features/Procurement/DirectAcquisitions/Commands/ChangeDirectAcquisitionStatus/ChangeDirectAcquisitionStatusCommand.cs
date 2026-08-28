using System;
using ERPEZ.Domain.Enums;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Commands.ChangeDirectAcquisitionStatus;

public class ChangeDirectAcquisitionStatusCommand : IRequest<ApiResponse<Unit>>
{
    public Guid DirectAcquisitionId { get; set; }
    public DirectAcquisitionStatusEnum Status { get; set; }
}
