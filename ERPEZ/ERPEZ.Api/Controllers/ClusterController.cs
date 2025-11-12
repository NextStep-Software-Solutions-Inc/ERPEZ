using ERPEZ.Application.Features.Planning.Cluster.Commands.CreateCluster;
using ERPEZ.Application.Features.Planning.Cluster.Commands.DeleteCluster;
using ERPEZ.Application.Features.Planning.Cluster.Commands.UpdateCluster;
using ERPEZ.Application.Features.Planning.Cluster.Dtos;
using ERPEZ.Application.Features.Planning.Cluster.Queries.GetClusterById;
using ERPEZ.Application.Features.Planning.Cluster.Queries.GetClusters;
using ERPEZ.Shared.Common;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPEZ.Api.Controllers
{
    // Sets the route to 'clusters'
    [Route("clusters")]
    [ApiController]
    public class ClusterController(ISender mediator) : ControllerBase
    {
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<ClusterResponse>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<ClusterResponse>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateCluster([FromBody] CreateClusterCommand command)
        {
            var result = await mediator.Send(command);

            if (!result.Succeeded)
                return BadRequest(result);

            return CreatedAtAction(nameof(GetClusterById), new { id = result.Data!.Id }, result);
        }

        [HttpGet]
        [ProducesResponseType(typeof(PaginatedApiResponse<ClusterResponse>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetClusters([FromQuery] GetClustersQuery query)
        {
            var result = await mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<ClusterResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetClusterById(Guid id)
        {
            var result = await mediator.Send(new GetClusterByIdQuery(id));

            return result.Succeeded ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<ClusterResponse>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateCluster(Guid id, [FromBody] UpdateClusterRequest dto)
        {
            var command = new UpdateClusterCommand
            {
                Id = id,
                UpdateCluster = dto
            };

            var result = await mediator.Send(command);
            return result.Succeeded ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteCluster(Guid id)
        {
            var command = new DeleteClusterCommand(id);
            var result = await mediator.Send(command);

            return result.Succeeded ? NoContent() : BadRequest(result);
        }
    }
}
