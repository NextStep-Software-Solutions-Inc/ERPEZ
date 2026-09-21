using Microsoft.Extensions.Options;
using Sieve.Exceptions;
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
            return SafeBaseFiltering(model, result, dataForCustomMethods);

        var filterSegments = model.Filters.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var orSegmentIndex = Array.FindIndex(filterSegments, s => s.Contains('|'));

        if (orSegmentIndex == -1)
            return SafeBaseFiltering(model, result, dataForCustomMethods);

        var orSegment = filterSegments[orSegmentIndex];
        var orParts = orSegment.Split('|', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        // Detect property names on each side of |
        var regex = new System.Text.RegularExpressions.Regex(@"^([a-zA-Z0-9_\.]+?)(==\*|==|!=|>=|<=|>|<|@=\*|@=|!@=|_=)");
        var propNames = orParts
            .Select(p => regex.Match(p).Groups[1].Value)
            .Where(p => !string.IsNullOrEmpty(p))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        if (propNames.Count <= 1)
        {
            // Same property OR (e.g. status==A|status==B) — standard Sieve handles this natively
            return SafeBaseFiltering(model, result, dataForCustomMethods);
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

    /// <summary>
    /// Calls base.ApplyFiltering and silently swallows SieveMethodNotFoundException so that
    /// unknown or unmapped filter properties don't crash the entire request.
    /// </summary>
    private IQueryable<TEntity> SafeBaseFiltering<TEntity>(
        SieveModel? model,
        IQueryable<TEntity> result,
        object[]? dataForCustomMethods)
    {
        try
        {
            return base.ApplyFiltering(model, result, dataForCustomMethods);
        }
        catch (SieveMethodNotFoundException)
        {
            // A filter property was not found in Sieve configuration or entity attributes.
            // Return unfiltered result rather than crashing.
            return result;
        }
        catch (SieveIncompatibleMethodException)
        {
            return result;
        }
    }
}
