using System;
using ERPEZ.Application.Features.Procurement.DirectAcquisitions.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Commands.RecordDirectPurchase;

public class RecordDirectPurchaseCommand : IRequest<ApiResponse<Guid>>
{
    public Guid DirectAcquisitionId { get; set; }
    public RecordDirectPurchaseRequest Request { get; set; } = new();
}
