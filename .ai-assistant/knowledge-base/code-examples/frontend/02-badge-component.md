# Example: Badge Component with Computed Properties (Vue 3)

**File**: `packages/frontend/editor-ui/src/features/workflows/workflowDiff/DiffBadge.vue`

**Category**: Frontend - Vue 3 Component  
**Complexity**: Intermediate  
**Pattern**: Component with Props + Computed Properties

---

## Purpose

A badge component that displays different labels and colors based on node diff status. Demonstrates Vue 3 Composition API with props, computed properties, and dynamic styling.

---

## Complete Code

```vue
<script setup lang="ts">
import { NodeDiffStatus } from 'n8n-workflow';
import { computed } from 'vue';

const props = defineProps<{
	type: NodeDiffStatus;
}>();

const label = computed(() => {
	switch (props.type) {
		case NodeDiffStatus.Added:
			return 'N';
		case NodeDiffStatus.Deleted:
			return 'D';
		case NodeDiffStatus.Modified:
			return 'M';
		default:
			return '';
	}
});

const backgroundColor = computed(() => {
	switch (props.type) {
		case NodeDiffStatus.Added:
			return 'var(--node--icon--color--green)';
		case NodeDiffStatus.Deleted:
			return 'var(--node--icon--color--red)';
		case NodeDiffStatus.Modified:
			return 'var(--node--icon--color--orange)';
		default:
			return '';
	}
});
</script>

<template>
	<div :class="$style.diffBadge">
		{{ label }}
	</div>
</template>

<style module>
.diffBadge {
	background-color: v-bind(backgroundColor);
	display: inline-flex;
	align-items: center;
	justify-content: center;
	color: var(--color--text--tint-3);
	font-size: var(--font-size--3xs);
	font-weight: 700;
	width: 16px;
	height: 16px;
	border-radius: 4px;
	flex-shrink: 0;
}
</style>
```

---

## Key Patterns

### 1. **Composition API with TypeScript** ✅
```typescript
const props = defineProps<{
	type: NodeDiffStatus;
}>();
```
- Use `<script setup lang="ts">` for Composition API
- Define props with TypeScript types
- Import types from appropriate packages

### 2. **Computed Properties**
```typescript
const label = computed(() => {
	switch (props.type) {
		case NodeDiffStatus.Added:
			return 'N';
		// ...
	}
});
```
- Use `computed()` for derived values
- Access props via `props.propName`
- Return different values based on conditions

### 3. **CSS Modules** ✅
```vue
<style module>
.diffBadge { /* ... */ }
</style>
```
- Use `<style module>` instead of `scoped`
- Access classes via `$style.className`
- Provides better type safety

### 4. **Dynamic CSS with v-bind** ✅
```scss
.diffBadge {
	background-color: v-bind(backgroundColor);
}
```
- Use `v-bind()` to bind computed values to CSS
- Reactive styling based on component state
- Modern Vue 3 feature

### 5. **CSS Variables for Static Values** ✅
```scss
color: var(--color--text--tint-3);
font-size: var(--font-size--3xs);
```
- Use CSS variables for all static values
- Never hardcode colors, sizes, or spacing

---

## When to Use This Pattern

✅ **Use for**:
- Components with dynamic styling
- Badge, tag, or status indicators
- Components with conditional rendering
- Type-safe prop validation

❌ **Don't use for**:
- Very simple static components
- Components requiring complex state management (use Pinia)

---

## n8n Conventions Applied

1. ✅ **TypeScript**: Strongly typed props
2. ✅ **Composition API**: Uses `<script setup>`
3. ✅ **CSS Variables**: All colors and sizes from design system
4. ✅ **CSS Modules**: Better than scoped styles
5. ✅ **Imports**: Types from `n8n-workflow` package
6. ✅ **No Hardcoded Values**: Everything uses variables

---

## Common Variations

### With Default Props
```typescript
const props = withDefaults(
	defineProps<{
		type: NodeDiffStatus;
		size?: 'sm' | 'md' | 'lg';
	}>(),
	{
		size: 'md',
	}
);
```

### With Emits
```typescript
const emit = defineEmits<{
	click: [type: NodeDiffStatus];
}>();

function handleClick() {
	emit('click', props.type);
}
```

### With Multiple Computed Properties
```typescript
const styles = computed(() => ({
	backgroundColor: backgroundColor.value,
	color: textColor.value,
	size: badgeSize.value,
}));
```

---

## Testing Example

```typescript
import { mount } from '@vue/test-utils';
import { NodeDiffStatus } from 'n8n-workflow';
import DiffBadge from './DiffBadge.vue';

describe('DiffBadge', () => {
	it('displays "N" for added status', () => {
		const wrapper = mount(DiffBadge, {
			props: { type: NodeDiffStatus.Added },
		});
		expect(wrapper.text()).toBe('N');
	});
	
	it('displays "D" for deleted status', () => {
		const wrapper = mount(DiffBadge, {
			props: { type: NodeDiffStatus.Deleted },
		});
		expect(wrapper.text()).toBe('D');
	});
});
```

---

## Related Patterns

- **Simple Component**: See `01-simple-icon-component.md`
- **Component with Events**: See `03-template-card.md`
- **Component with Store**: See `05-component-with-pinia.md`

---

**Last Updated**: 2026-01-11  
**Source**: n8n production codebase  
**Confidence**: High
