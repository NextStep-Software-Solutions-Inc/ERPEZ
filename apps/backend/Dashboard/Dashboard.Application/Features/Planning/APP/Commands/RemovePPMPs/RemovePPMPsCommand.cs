using ERPEZ.Shared.Common;
using MediatR;
using System;
using System.Collections.Generic;

namespace ERPEZ.Application.Features.Planning.APP.Commands.RemovePPMPs;

public record RemovePPMPsCommand : IRequest<ApiResponse<Unit>>
{
    public Guid APPId { get; init; }
    public List<Guid> PPMPIds { get; init; } = [];
}
