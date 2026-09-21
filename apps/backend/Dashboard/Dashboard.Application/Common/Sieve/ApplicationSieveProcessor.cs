using Microsoft.Extensions.Options;
using Sieve.Models;
using Sieve.Services;

namespace ERPEZ.Application.Common.Sieve;

public class ApplicationSieveProcessor(IOptions<SieveOptions> options) : SieveProcessor(options)
{
    protected override SievePropertyMapper MapProperties(SievePropertyMapper mapper)
    {
        mapper = base.MapProperties(mapper);
        
        // Instantiate configuration directly since this is called during base constructor
        // before any instance fields are initialized
        var configuration = new PlanningSieveConfiguration();
        configuration.Configure(mapper);
        
        return mapper;
    }

    protected override IQueryable<TEntity> ApplyFiltering<TEntity>(
        SieveModel model, 
        IQueryable<TEntity> result, 
        object[]? dataForCustomMethods = null)
    {
        if (string.IsNullOrWhiteSpace(model?.Filters))
            return base.ApplyFiltering(model, result, dataForCustomMethods);

        var filterSegments = model.Filters.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var orSegmentIndex = Array.FindIndex(filterSegments, s => s.Contains('|'));

        if (orSegmentIndex == -1)
            return base.ApplyFiltering(model, result, dataForCustomMethods);

        var orSegment = filterSegments[orSegmentIndex];
        var orParts = orSegment.Split('|', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        var regex = new System.Text.RegularExpressions.Regex(@"^([a-zA-Z0-9_\.]+?)(==\*|==|!=|>=|<=|>|<|@=\*|@=|!@=|_=)");
        var propNames = orParts
            .Select(p => regex.Match(p).Groups[1].Value)
            .Where(p => !string.IsNullOrEmpty(p))
            .Distinct()
            .ToList();

        if (propNames.Count <= 1)
        {
            // Same property or unparsed, let standard Sieve handle it
            return base.ApplyFiltering(model, result, dataForCustomMethods);
        }

        // Cross-property OR detected (e.g. Name@=*502|Code@=*502)
        var otherSegments = filterSegments.Where((_, i) => i != orSegmentIndex).ToList();
        IQueryable<TEntity>? combined = null;

        foreach (var part in orParts)
        {
            var branchFilter = otherSegments.Count > 0 
                ? $"{part},{string.Join(",", otherSegments)}" 
                : part;

            var branchModel = new SieveModel
            {
                Filters = branchFilter,
                Sorts = model.Sorts
            };

            var branchQuery = ApplyFiltering(branchModel, result, dataForCustomMethods);
            combined = combined == null ? branchQuery : combined.Union(branchQuery);
        }

        return combined ?? result;
    }
}
