# Simple Node Example: NoOp

**Category**: Nodes  
**Complexity**: Beginner  
**Purpose**: The simplest possible n8n node - passes data through without modification

## Overview

The NoOp node is the simplest example of an n8n node. It demonstrates:
- Basic node structure
- Node interface implementation
- Minimal configuration
- Data passthrough

## Source File

`packages/nodes-base/nodes/NoOp/NoOp.node.ts`

## Complete Code

```typescript
import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

export class NoOp implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'No Operation, do nothing',
		name: 'noOp',
		icon: 'fa:arrow-right',
		iconColor: 'gray',
		group: ['organization'],
		version: 1,
		description: 'No Operation',
		defaults: {
			name: 'No Operation, do nothing',
			color: '#b0b0b0',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		properties: [],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		return [items];
	}
}
```

## Key Patterns

### 1. **Node Structure**
- Implements `INodeType` interface
- Has `description` property for node metadata
- Has `execute` method for runtime logic

### 2. **Node Description**
```typescript
description: INodeTypeDescription = {
	displayName: 'No Operation, do nothing',  // UI display name
	name: 'noOp',                             // Internal identifier (camelCase)
	icon: 'fa:arrow-right',                   // Icon (FontAwesome or file)
	group: ['organization'],                  // Category for grouping
	version: 1,                               // Node version
	inputs: [NodeConnectionTypes.Main],       // Input connection types
	outputs: [NodeConnectionTypes.Main],      // Output connection types
	properties: [],                           // Node parameters (empty for NoOp)
}
```

### 3. **Execute Method**
```typescript
async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	// Get data from previous node
	const items = this.getInputData();
	
	// Return data to next node
	// Note: Wrapped in array because node can have multiple outputs
	return [items];
}
```

## When to Use This Pattern

Use this minimal node pattern when:
- Creating a template for a new node
- Building a passthrough or organizational node
- Testing workflow structure
- Learning node basics

## Variations

### With Parameter

Add to `properties`:
```typescript
properties: [
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		default: '',
		description: 'Optional description',
	},
]
```

### With Custom Icon

```typescript
icon: 'file:myicon.svg',  // Custom SVG in same directory
```

### Multiple Versions

```typescript
version: [1, 2],  // Support multiple versions
```

## Related Patterns

- **Node with Parameters**: See `ExecuteCommand.node.example.md`
- **Node with API Calls**: See `api-node.example.md`
- **Node with Credentials**: See `node-with-credentials.example.md`

## Testing

```typescript
// Test in packages/nodes-base/nodes/NoOp/NoOp.node.test.ts
import { NoOp } from './NoOp.node';

describe('NoOp', () => {
	it('should pass through data unchanged', async () => {
		const node = new NoOp();
		const inputData = [{ json: { test: 'data' } }];
		
		const executeFunctions = createMockExecuteFunctions(inputData);
		const result = await node.execute.call(executeFunctions);
		
		expect(result[0]).toEqual(inputData);
	});
});
```

## Common Pitfalls

1. **Forgetting the array wrapper**: 
   ```typescript
   return [items];  // ✅ Correct
   return items;    // ❌ Wrong - not wrapped in array
   ```

2. **Wrong connection type**:
   ```typescript
   inputs: [NodeConnectionTypes.Main],   // ✅ Correct
   inputs: ['main'],                     // ❌ Wrong - use enum
   ```

3. **Missing required properties**:
   - `displayName`
   - `name`
   - `version`
   - `inputs`
   - `outputs`

## File Structure

```
nodes/NoOp/
├── NoOp.node.ts          # Main node file
├── NoOp.node.json        # Package metadata
└── noOp.svg              # Icon (optional)
```

## Key Takeaways

1. Minimal node is ~30 lines of code
2. Must implement `INodeType` interface
3. Execute method receives `IExecuteFunctions` context
4. Input/output data is wrapped in arrays
5. Node description defines UI and behavior

---

**Complexity**: ⭐ Beginner  
**Lines of Code**: 32  
**Last Updated**: 2026-01-11  
**Status**: Production-ready pattern
