using System;
using ERPEZ.Application.Features.Procurement.DirectAcquisitions.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Commands.ApproveDirectAcquisition;

public class ApproveDirectAcquisitionCommand : IRequest<ApiResponse<Unit>>
{
    public Guid DirectAcquisitionId { get; set; }
    public ApproveDirectAcquisitionRequest Request { get; set; } = new();
}
