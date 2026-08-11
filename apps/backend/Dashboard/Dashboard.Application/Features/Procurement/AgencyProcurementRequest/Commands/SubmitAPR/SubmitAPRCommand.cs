using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AgencyProcurementRequest.Commands.SubmitAPR;

public record SubmitAPRCommand(Guid Id) : IRequest<ApiResponse<string>>;
