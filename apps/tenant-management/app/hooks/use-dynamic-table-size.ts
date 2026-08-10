import { useState, useEffect } from "react";

interface UseDynamicTableSizeOptions {
    /** Minimum number of rows to display */
    minRows?: number;
    /** Maximum number of rows to display */
    maxRows?: number;
    /** Estimated height of each table row in pixels */
    rowHeight?: number;
    /** Height to reserve for header, pagination, and other elements */
    reservedHeight?: number;
}

export function useDynamicTableSize({
    minRows = 5,
    maxRows = 50,
    rowHeight = 48, // Approximate height of a table row including padding and borders
    reservedHeight = 300, // Space for header, toolbar, pagination, etc.
}: UseDynamicTableSizeOptions = {}) {
    const [pageSize, setPageSize] = useState(minRows);

    useEffect(() => {
        const calculatePageSize = () => {
            const windowHeight = window.innerHeight;
            const availableHeight = windowHeight - reservedHeight;
            const calculatedRows = Math.floor(availableHeight / rowHeight);

            // Ensure the page size is within bounds
            const newPageSize = Math.max(minRows, Math.min(maxRows, calculatedRows));
            setPageSize(newPageSize);
        };

        // Calculate initial page size
        calculatePageSize();

        // Recalculate on window resize
        window.addEventListener('resize', calculatePageSize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', calculatePageSize);
        };
    }, [minRows, maxRows, rowHeight, reservedHeight]);

    return pageSize;
}