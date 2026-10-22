using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.CreateBiddingAwardRecommendation;
using ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.EvaluateProjectBids;
using ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.LogPostQualificationDocsReceived;
using ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.RecordBidOpening;
using ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.RecordPostQualificationResult;
using ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.SendPostQualificationNotice;
using ERPEZ.Application.Features.Procurement.BidEvaluations.Commands.SubmitBiddingPackage;
using ERPEZ.Application.Features.Procurement.BidEvaluations.Dtos;
using ERPEZ.Application.Features.Procurement.BidEvaluations.Queries.GetProjectBidEvaluation;
using ERPEZ.Application.Features.Procurement.BidEvaluations.Queries.GetProjectBiddingSubmissions;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers;

[Route("bac/projects/{projectId:guid}")]
[ApiController]
public class BidEvaluationController(ISender mediator) : ControllerBase
{
    /// <summary>
    /// Submit a supplier's bidding package for a public bidding project
    /// </summary>
    [HttpPost("submissions")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SubmitBiddingPackage(Guid projectId, [FromBody] SubmitBiddingPackageRequest request)
    {
        var result = await mediator.Send(new SubmitBiddingPackageCommand 
        { 
            ProjectId = projectId, 
            Request = request 
        });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Get all submitted bidding packages for a project
    /// </summary>
    [HttpGet("submissions")]
    [ProducesResponseType(typeof(ApiResponse<List<BiddingSubmissionResponse>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetBiddingSubmissions(Guid projectId)
    {
        var result = await mediator.Send(new GetProjectBiddingSubmissionsQuery(projectId));
        return Ok(result);
    }

    /// <summary>
    /// Record official BAC bid opening result for a submission during the scheduled opening session
    /// </summary>
    [HttpPost("opening")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RecordBidOpening(Guid projectId, [FromBody] RecordBidOpeningRequest request)
    {
        var result = await mediator.Send(new RecordBidOpeningCommand 
        { 
            ProjectId = projectId, 
            Request = request 
        });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Get the authoritative bid evaluation and ranked bidders for a project
    /// </summary>
    [HttpGet("evaluation")]
    [ProducesResponseType(typeof(ApiResponse<BiddingEvaluationResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProjectBidEvaluation(Guid projectId)
    {
        var result = await mediator.Send(new GetProjectBidEvaluationQuery(projectId));
        return result.Succeeded ? Ok(result) : NotFound(result);
    }

    /// <summary>
    /// Execute bid evaluation, calculate scores, and establish official ranking
    /// </summary>
    [HttpPost("evaluation")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> EvaluateProjectBids(Guid projectId, [FromBody] EvaluateProjectBidsRequest request)
    {
        var result = await mediator.Send(new EvaluateProjectBidsCommand 
        { 
            ProjectId = projectId, 
            Request = request 
        });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Send Notice of Post-Qualification to ranked bidder (Starts 5-day document SLA)
    /// </summary>
    [HttpPost("evaluation/notice")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> SendPostQualificationNotice(Guid projectId, [FromBody] SendPostQualificationNoticeRequest request)
    {
        var result = await mediator.Send(new SendPostQualificationNoticeCommand 
        { 
            ProjectId = projectId, 
            Request = request 
        });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Log receipt of original post-qualification documents (Stops bidder SLA, starts BAC 12-day SLA)
    /// </summary>
    [HttpPost("evaluation/docs-received")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> LogPostQualificationDocsReceived(Guid projectId, [FromBody] LogPostQualificationDocsReceivedRequest request)
    {
        var result = await mediator.Send(new LogPostQualificationDocsReceivedCommand 
        { 
            ProjectId = projectId, 
            Request = request 
        });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Record post-qualification result (Pass = eligible for award, Fail = disqualify and cascade to next-ranked bidder)
    /// </summary>
    [HttpPost("evaluation/post-qual-result")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RecordPostQualificationResult(Guid projectId, [FromBody] RecordPostQualificationResultRequest request)
    {
        var result = await mediator.Send(new RecordPostQualificationResultCommand 
        { 
            ProjectId = projectId, 
            Request = request 
        });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }

    /// <summary>
    /// Create the authoritative Bidding Award Recommendation from passed post-qualification
    /// </summary>
    [HttpPost("evaluation/recommend-award")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateBiddingAwardRecommendation(Guid projectId, [FromBody] CreateBiddingAwardRecommendationRequest request)
    {
        var result = await mediator.Send(new CreateBiddingAwardRecommendationCommand 
        { 
            ProjectId = projectId, 
            Request = request 
        });
        return result.Succeeded ? Ok(result) : BadRequest(result);
    }
}
