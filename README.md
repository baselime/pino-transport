# Pino Baselime
Ship logs from pino.js to Baselime

## Installation

```bash
npm i pino @baselime/pino-transport
```

## How to Use

```typescript
import pino from 'pino';

const transport = pino.transport({
  target: "@baselime/pino-transport",
  options: { baselimeApiKey: process.env.BASELIME_API_KEY }
});

const logger = pino(transport);
```