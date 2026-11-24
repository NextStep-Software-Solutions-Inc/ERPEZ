using System;
using ERPEZ.Application.Features.Procurement.DirectAcquisitions.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Commands.ReturnDirectAcquisition;

public class ReturnDirectAcquisitionCommand : IRequest<ApiResponse<Unit>>
{
    public Guid DirectAcquisitionId { get; set; }
    public ReturnDirectAcquisitionRequest Request { get; set; } = new();
}
