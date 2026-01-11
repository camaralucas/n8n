# Node with Parameters Example: ExecuteCommand

**Category**: Nodes  
**Complexity**: Intermediate  
**Purpose**: Node with parameters, error handling, and conditional execution

## Overview

The ExecuteCommand node demonstrates:
- Node parameters definition
- Parameter retrieval in execute method
- Error handling with `NodeOperationError`
- Conditional execution (`executeOnce` option)
- Data transformation and output

## Source File

`packages/nodes-base/nodes/ExecuteCommand/ExecuteCommand.node.ts`

## Complete Code (Simplified)

```typescript
import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

export class ExecuteCommand implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Execute Command',
		name: 'executeCommand',
		icon: 'fa:terminal',
		iconColor: 'crimson',
		group: ['transform'],
		version: 1,
		description: 'Executes a command on the host',
		defaults: {
			name: 'Execute Command',
			color: '#886644',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		properties: [
			{
				displayName: 'Execute Once',
				name: 'executeOnce',
				type: 'boolean',
				default: true,
				description: 'Whether to execute only once instead of once for each entry',
			},
			{
				displayName: 'Command',
				name: 'command',
				typeOptions: {
					rows: 5,
				},
				type: 'string',
				default: '',
				placeholder: 'echo "test"',
				description: 'The command to execute',
				required: true,
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		let items = this.getInputData();

		// Get parameter value
		const executeOnce = this.getNodeParameter('executeOnce', 0) as boolean;

		if (executeOnce) {
			items = [items[0]];
		}

		const returnItems: INodeExecutionData[] = [];
		
		// Process each item
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				// Get parameter for specific item
				const command = this.getNodeParameter('command', itemIndex) as string;

				// Execute command (simplified)
				const { error, exitCode, stdout, stderr } = await execCommand(command);

				if (error !== undefined) {
					throw new NodeOperationError(this.getNode(), error.message, { itemIndex });
				}

				// Build output data
				returnItems.push({
					json: {
						exitCode,
						stderr,
						stdout,
					},
					pairedItem: {
						item: itemIndex,
					},
				});
			} catch (error) {
				// Handle error with continueOnFail
				if (this.continueOnFail()) {
					returnItems.push({
						json: {
							error: error.message,
						},
						pairedItem: {
							item: itemIndex,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return [returnItems];
	}
}
```

## Key Patterns

### 1. **Defining Parameters**

```typescript
properties: [
	{
		displayName: 'Execute Once',        // Label in UI
		name: 'executeOnce',                // Internal name
		type: 'boolean',                    // Parameter type
		default: true,                      // Default value
		description: 'Whether to execute only once...',  // Help text
	},
	{
		displayName: 'Command',
		name: 'command',
		type: 'string',
		typeOptions: {
			rows: 5,                        // Multiline textarea
		},
		default: '',
		placeholder: 'echo "test"',        // Placeholder text
		description: 'The command to execute',
		required: true,                     // Mandatory field
	},
]
```

### 2. **Getting Parameter Values**

```typescript
// Get parameter value for item 0 (used for non-item-specific parameters)
const executeOnce = this.getNodeParameter('executeOnce', 0) as boolean;

// Get parameter value for specific item index
const command = this.getNodeParameter('command', itemIndex) as string;
```

### 3. **Error Handling**

```typescript
try {
	// Execute logic
	const result = await someOperation();
	
	if (result.error) {
		// Throw NodeOperationError with itemIndex for context
		throw new NodeOperationError(
			this.getNode(), 
			error.message, 
			{ itemIndex }
		);
	}
} catch (error) {
	// Check if workflow has "continueOnFail" enabled
	if (this.continueOnFail()) {
		returnItems.push({
			json: { error: error.message },
			pairedItem: { item: itemIndex },
		});
		continue;  // Don't throw, continue to next item
	}
	throw error;  // Re-throw if not continuing on fail
}
```

### 4. **Processing Items**

```typescript
const returnItems: INodeExecutionData[] = [];

for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
	// Process each item
	const result = await processItem(items[itemIndex]);
	
	returnItems.push({
		json: result,              // Output data
		pairedItem: {              // Link to input item
			item: itemIndex,
		},
	});
}

return [returnItems];
```

### 5. **Conditional Execution**

```typescript
let items = this.getInputData();
const executeOnce = this.getNodeParameter('executeOnce', 0) as boolean;

if (executeOnce) {
	items = [items[0]];  // Process only first item
}
```

## Parameter Types

### Available Types

```typescript
// String input
type: 'string'

// Number input
type: 'number'

// Boolean checkbox
type: 'boolean'

// Dropdown select
type: 'options',
options: [
	{ name: 'Option 1', value: 'opt1' },
	{ name: 'Option 2', value: 'opt2' },
]

// Multi-select
type: 'multiOptions',
options: [...]

// JSON editor
type: 'json'

// Collection (nested parameters)
type: 'collection',
options: [...]
```

## Error Handling Best Practices

### 1. Use NodeOperationError

```typescript
throw new NodeOperationError(
	this.getNode(),          // Current node context
	'Error message',         // User-friendly message
	{ itemIndex }            // Additional context
);
```

### 2. Respect continueOnFail

```typescript
if (this.continueOnFail()) {
	// Return error as data, don't throw
	returnItems.push({
		json: { error: error.message },
		pairedItem: { item: itemIndex },
	});
	continue;
}
throw error;
```

### 3. Provide Context

```typescript
throw new NodeOperationError(
	this.getNode(),
	`Failed to execute command: ${command}`,
	{
		itemIndex,
		description: 'Check if command is valid',
		// Can include additional data
	}
);
```

## Common Patterns

### Optional Parameters

```typescript
{
	displayName: 'Options',
	name: 'options',
	type: 'collection',
	placeholder: 'Add Option',
	default: {},
	options: [
		{
			displayName: 'Timeout',
			name: 'timeout',
			type: 'number',
			default: 10000,
		},
	],
}

// Getting optional parameter
const options = this.getNodeParameter('options', itemIndex, {}) as IDataObject;
const timeout = options.timeout as number || 10000;
```

### Conditional Display

```typescript
{
	displayName: 'Format',
	name: 'format',
	type: 'options',
	options: [
		{ name: 'JSON', value: 'json' },
		{ name: 'Text', value: 'text' },
	],
	default: 'json',
},
{
	displayName: 'JSON Options',
	name: 'jsonOptions',
	type: 'collection',
	displayOptions: {
		show: {
			format: ['json'],  // Only show when format is 'json'
		},
	},
	default: {},
	options: [...],
}
```

## Testing

```typescript
describe('ExecuteCommand', () => {
	it('should execute command once when executeOnce is true', async () => {
		const node = new ExecuteCommand();
		const inputData = [
			{ json: { test: 1 } },
			{ json: { test: 2 } },
		];
		
		const executeFunctions = createMockExecuteFunctions(inputData, {
			executeOnce: true,
			command: 'echo "test"',
		});
		
		const result = await node.execute.call(executeFunctions);
		
		expect(result[0]).toHaveLength(1);  // Only one execution
	});
});
```

## Key Takeaways

1. **Parameters** are defined in `properties` array
2. **Get values** with `this.getNodeParameter(name, itemIndex)`
3. **Error handling** uses `NodeOperationError` with context
4. **Continue on fail** allows workflows to continue after errors
5. **Item pairing** links output data to input items
6. **Type safety** always cast parameter values to expected type

---

**Complexity**: ⭐⭐ Intermediate  
**Lines of Code**: ~130  
**Key Patterns**: Parameters, Error Handling, Item Processing  
**Last Updated**: 2026-01-11  
**Status**: Production-ready pattern
