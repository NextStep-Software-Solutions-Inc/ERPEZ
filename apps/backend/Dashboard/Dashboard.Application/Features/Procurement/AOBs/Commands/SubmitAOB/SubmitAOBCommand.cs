using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.SubmitAOB;

public record SubmitAOBCommand(Guid AOBId, Guid? SubmittedBy = null) : IRequest<ApiResponse<Unit>>;
