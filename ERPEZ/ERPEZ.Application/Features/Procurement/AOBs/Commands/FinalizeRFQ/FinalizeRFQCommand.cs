using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.FinalizeRFQ;

public record FinalizeRFQCommand(Guid ProcurementProjectId) : IRequest<ApiResponse<Unit>>;
