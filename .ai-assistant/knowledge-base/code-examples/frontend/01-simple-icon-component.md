# Example: Simple Icon Component (Vue 3)

**File**: `packages/frontend/editor-ui/src/features/workflows/templates/components/IconSuccess.vue`

**Category**: Frontend - Vue 3 Component  
**Complexity**: Simple  
**Pattern**: Presentational Component

---

## Purpose

A minimal Vue 3 component that displays a success icon using Element Plus icon system. This demonstrates the simplest form of a Vue component with scoped styling.

---

## Complete Code

```vue
<template>
	<i class="el-icon-success" />
</template>

<style lang="scss" scoped>
i {
	color: var(--color--success);
}
</style>
```

---

## Key Patterns

### 1. **Minimal Component Structure**
- No `<script>` section needed for purely presentational components
- Just template + styles

### 2. **CSS Variables Usage** ✅
```scss
color: var(--color--success);
```
- **ALWAYS use CSS variables** - never hardcode colors
- Follows n8n design system conventions
- Available variables: `--color--success`, `--color--primary`, `--spacing--sm`, etc.

### 3. **Scoped Styles**
```vue
<style lang="scss" scoped>
```
- Use `scoped` to prevent style leakage
- Styles only apply to this component

---

## When to Use This Pattern

✅ **Use for**:
- Simple presentational components
- Icon wrappers
- Static UI elements
- Components with no logic

❌ **Don't use for**:
- Components with props or state
- Components with events
- Complex UI logic

---

## Related Patterns

- **With Props**: See `02-badge-component.md`
- **With Events**: See `03-template-card.md`
- **With Composables**: See `04-component-with-composable.md`

---

## n8n Conventions Applied

1. ✅ **CSS Variables**: Uses `var(--color--success)` instead of hardcoded color
2. ✅ **Scoped Styles**: Prevents global style pollution
3. ✅ **SCSS**: Uses SCSS for styling (n8n standard)
4. ✅ **Minimal Code**: No unnecessary complexity

---

## Common Variations

### With Different Colors
```vue
<style lang="scss" scoped>
i {
	color: var(--color--danger);    /* Red */
	color: var(--color--warning);   /* Yellow */
	color: var(--color--primary);   /* Blue */
}
</style>
```

### With Spacing
```vue
<style lang="scss" scoped>
i {
	color: var(--color--success);
	margin: var(--spacing--xs);
	padding: var(--spacing--sm);
}
</style>
```

---

## Testing Considerations

```typescript
// Example test (Vitest)
import { mount } from '@vue/test-utils';
import IconSuccess from './IconSuccess.vue';

describe('IconSuccess', () => {
	it('renders icon with correct class', () => {
		const wrapper = mount(IconSuccess);
		expect(wrapper.find('i').classes()).toContain('el-icon-success');
	});
});
```

---

**Last Updated**: 2026-01-11  
**Source**: n8n production codebase  
**Confidence**: High
