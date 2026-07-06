using ERPEZ.Shared.Common;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Interfaces;
using FluentValidation;
using MediatR;
 
namespace ERPEZ.Application.RFQ.Commands.AddRFQItems;

public record AddRFQItemsCommand(
    Guid RFQId,
    List<AddRFQItemDto> Items
) : IRequest<ApiResponse<bool>>;
