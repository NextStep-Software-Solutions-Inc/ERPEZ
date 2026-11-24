using System;
using ERPEZ.Shared.Common;
using MediatR;

namespace ERPEZ.Application.Features.Procurement.Contracts.Commands.SubmitContract;

public record SubmitContractCommand(Guid Id) : IRequest<ApiResponse<bool>>;
