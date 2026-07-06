using ERPEZ.Shared.Common;
using ERPEZ.Domain.Entities.Procurement;
using ERPEZ.Domain.Enums;
using ERPEZ.Domain.Interfaces;
using FluentValidation;
using MediatR;
 
namespace ERPEZ.Application.RFQ.Commands.CreateRFQ;
 
public record CreateRFQCommand(
    string RFQNumber,
    string TracingNumber,
    string? Description,
    DateOnly Date,
    DateOnly? Deadline,
    string? DeliveryPeriod,
    string? Purpose,
    List<Guid> SupplierIds
) : IRequest<ApiResponse<Guid>>;
