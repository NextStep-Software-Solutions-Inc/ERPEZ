using System;
using System.Collections.Generic;

namespace ERPEZ.Application.Features.Planning.APP.Dtos;

public record RemovePPMPsRequest
{
    public List<Guid> PPMPIds { get; init; } = [];
}
