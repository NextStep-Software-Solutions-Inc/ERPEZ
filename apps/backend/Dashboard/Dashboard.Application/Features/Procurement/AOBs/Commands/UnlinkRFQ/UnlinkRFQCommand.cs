using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.UnlinkRFQ;

public record UnlinkRFQCommand(Guid AOBId, Guid RFQId) : IRequest<ApiResponse<Unit>>;
