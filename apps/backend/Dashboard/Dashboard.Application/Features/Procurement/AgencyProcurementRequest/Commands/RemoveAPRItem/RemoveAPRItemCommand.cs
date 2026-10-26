using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.RemoveAPRItem;

public record RemoveAPRItemCommand(Guid APRId, string ItemIdentifier) : IRequest<ApiResponse<Guid>>;
