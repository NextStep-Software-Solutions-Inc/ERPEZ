using ERPEZ.Shared.Common;
using ERPEZ.Domain.Interfaces;
using FluentValidation;
using MediatR;
 
namespace ERPEZ.Application.RFQ.Commands.RemoveRFQItem;
 
public record RemoveRFQItemCommand(Guid RFQId, Guid RFQItemId) : IRequest<ApiResponse<bool>>;
