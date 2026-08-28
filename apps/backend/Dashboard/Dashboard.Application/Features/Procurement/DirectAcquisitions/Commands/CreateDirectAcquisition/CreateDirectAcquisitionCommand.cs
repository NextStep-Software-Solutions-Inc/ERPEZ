using System;
using ERPEZ.Application.Features.Procurement.DirectAcquisitions.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Commands.CreateDirectAcquisition;

public class CreateDirectAcquisitionCommand : IRequest<ApiResponse<Guid>>
{
    public CreateDirectAcquisitionRequest Request { get; set; } = new();
}
