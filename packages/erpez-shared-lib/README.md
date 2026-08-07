# erpez-shared-lib

## Overview
`erpez-shared-lib` is a TypeScript-based shared library designed to facilitate the creation of custom query hooks using React Query. It provides utilities for building API endpoints and managing path and query parameters efficiently.

## Installation
To install the library, use npm or yarn:

```bash
npm install erpez-shared-lib
```

or

```bash
yarn add erpez-shared-lib
```

## Usage
To use the library, import the necessary functions from the package. Here’s an example of how to create a custom query hook:

```typescript
import { createQueryHookFromTemplate } from 'erpez-shared-lib/factories/createQueryHookFromTemplate';
import { QueryBlueprintFromTemplate } from 'erpez-shared-lib/types';

const blueprint: QueryBlueprintFromTemplate<'/api/data', DataResponseType> = {
    endpoint: '/api/data',
    key: ({ url }) => [url],
    fetcher: async ({ finalUrl, signal }) => {
        const response = await fetch(finalUrl, { signal });
        return response.json();
    },
    defaultOptions: {
        staleTime: 1000 * 60, // 1 minute
    },
};

const useDataQuery = createQueryHookFromTemplate(blueprint);
```

## API
### `createQueryHookFromTemplate`
- **Parameters**: A blueprint object defining the endpoint, key, fetcher, and default options.
- **Returns**: A custom query hook that can be used in your components.

## Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for more details.