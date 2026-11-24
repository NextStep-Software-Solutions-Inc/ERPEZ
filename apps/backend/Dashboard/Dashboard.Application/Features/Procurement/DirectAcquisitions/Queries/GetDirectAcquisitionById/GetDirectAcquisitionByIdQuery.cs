using System;
using ERPEZ.Application.Features.Procurement.DirectAcquisitions.Dtos;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.DirectAcquisitions.Queries.GetDirectAcquisitionById;

public class GetDirectAcquisitionByIdQuery(Guid id) : IRequest<ApiResponse<DirectAcquisitionResponse>>
{
    public Guid Id { get; set; } = id;
}
