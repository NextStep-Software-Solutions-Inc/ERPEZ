using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.AOBs.Commands.ReturnAOB;

public record ReturnAOBCommand(Guid AOBId, string Remarks) : IRequest<ApiResponse<Unit>>;
