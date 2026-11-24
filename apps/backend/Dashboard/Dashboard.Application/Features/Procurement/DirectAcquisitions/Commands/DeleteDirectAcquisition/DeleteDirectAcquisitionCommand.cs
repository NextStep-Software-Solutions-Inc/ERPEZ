using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Commands.DeleteDirectAcquisition;

public class DeleteDirectAcquisitionCommand(Guid id) : IRequest<ApiResponse<Unit>>
{
    public Guid Id { get; set; } = id;
}
