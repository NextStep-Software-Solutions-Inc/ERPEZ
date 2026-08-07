# PSDBM API Integration Day Notes

## Overview
The PSDBM (Personal Services Database Management) hooks include fallback behavior for graceful degradation during development. This document outlines critical points for integration day when the real PSDBM API endpoint becomes available.

## Current State (Development)
- **API Status**: Not implemented (throws `Error('PSDBM API not implemented yet')`)
- **Fallback Behavior**: Enabled by default (`enableFallback = true`)
- **Mock Data**: Comprehensive mock data provides full functionality during development

## Integration Day Checklist

### 🚨 Critical: Fallback Flag Management
The fallback mechanism has a **default-enabled** behavior that will persist even after the API goes live unless explicitly disabled:

```typescript
// Current implementation - fallback enabled by default
export function usePSDBMCatalog(options: UsePSDBMCatalogOptions = {}): UsePSDBMCatalogResult {
  const {
    enableFallback = true,  // ⚠️ CRITICAL: Defaults to TRUE
    // ...
  } = options
}
```

**Action Required**: On integration day, after the backend is ready:

1. **Immediate**: Remove/comment out the hardcoded throw statement:
   ```typescript
   // OLD (Development):
   throw new Error('PSDBM API not implemented yet')
   
   // NEW (Integration):
   const response = await api.get<APIResponse<PSDBMCatalogResponse>>('/api/psdbm/catalog', {
     params: { mode, search, category, depot, max }
   })
   return response.data
   ```

2. **Configuration**: Add an environment variable to control fallback behavior:
   ```typescript
   const enableFallback = process.env.VITE_PSDBM_FALLBACK_ENABLED !== 'false'
   ```

3. **Alternative**: Explicitly set `enableFallback: false` in production environment setup

### Affected Functions
- `usePSDBMCatalog()` - Lines 42-90
- `usePSDBMItem()` - Lines 105-135

**File**: `src/features/procurement/psdbm/hooks/usePSDBMCatalogWithFallback.ts`

## Behavior After Integration

### Production Behavior (With Real API + enableFallback = true)
```
Request Flow:
1. Try real API endpoint
2. If API succeeds → return real data ✓
3. If API fails → fallback to mock data (not ideal for production)
```

### Production Behavior (With Real API + enableFallback = false)
```
Request Flow:
1. Try real API endpoint
2. If API succeeds → return real data ✓
3. If API fails → throw error (proper production handling)
```

## Mock Data Path
- Fallback source: `src/features/procurement/psdbm/utils/psdbmFallback.ts`
- Mock data files:
  - `mocks/mockPSDBMCategories.ts`
  - `mocks/mockPSDBMDepots.ts`
  - `mocks/mockPSDBMItems.ts`

## Integration Testing Recommendations

1. **Before Going Live**: 
   - Test with real API endpoint
   - Verify error handling when API is temporarily unavailable
   - Confirm retry behavior

2. **Post-Integration**:
   - Monitor error logs for "PSDBM API failed" warnings
   - Verify no mock data is being used in production
   - Set up alerts if fallback is triggered

3. **Rollback Plan**:
   - If API is unstable during early integration, `enableFallback: true` can serve as an emergency fallback
   - Document this as a temporary measure only

## Related Hooks
- `usePSDBMCategories()` - Leverages `usePSDBMCatalog()` internally
- `usePSDBMDepots()` - Leverages `usePSDBMCatalog()` internally
- `usePSDBMItems()` - Leverages `usePSDBMCatalog()` internally

## Summary
⚠️ **Remember**: Once the PSDBM API is live, the default `enableFallback = true` will still allow mock data to be served on API failures. This should be explicitly disabled in production unless emergency fallback is intentionally desired.
