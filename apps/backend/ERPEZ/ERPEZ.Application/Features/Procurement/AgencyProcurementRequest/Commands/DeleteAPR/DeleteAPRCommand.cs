using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.DeleteAPR;

public record DeleteAPRCommand(Guid Id) : IRequest<ApiResponse<bool>>;
