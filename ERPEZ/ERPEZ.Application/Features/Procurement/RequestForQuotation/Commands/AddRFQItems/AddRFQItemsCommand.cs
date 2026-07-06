using ERPEZ.Shared.Common;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using ERPEZ.Application.Features.Procurement.RequestForQuotation.Dtos;
using FluentValidation;
using MediatR;
 
namespace ERPEZ.Application.Features.Procurement.RequestForQuotation.Commands.AddRFQItems;

public record AddRFQItemsCommand(
    Guid RFQId,
    List<AddRFQItemDto> Items
) : IRequest<ApiResponse<bool>>;
