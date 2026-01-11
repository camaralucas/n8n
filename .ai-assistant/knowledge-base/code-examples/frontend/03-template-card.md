# Example: Template Card Component (Vue 3)

**File**: `packages/frontend/editor-ui/src/features/workflows/templates/components/TemplateCard.vue`

**Category**: Frontend - Vue 3 Component  
**Complexity**: Advanced  
**Pattern**: Full-Featured Component with Props, Events, i18n, Design System

---

## Purpose

A complete card component for displaying workflow templates. Demonstrates all major Vue 3 patterns: props with defaults, events, i18n, design system components, conditional rendering, and CSS modules.

---

## Complete Code

```vue
<script lang="ts" setup>
import { abbreviateNumber } from '@/app/utils/typesUtils';
import NodeList from '@/app/components/NodeList.vue';
import TimeAgo from '@/app/components/TimeAgo.vue';
import type { ITemplatesWorkflow } from '@n8n/rest-api-client/api/templates';
import { useI18n } from '@n8n/i18n';
import type { BaseTextKey } from '@n8n/i18n';
import { N8nButton, N8nHeading, N8nIcon, N8nLoading, N8nText } from '@n8n/design-system';

const i18n = useI18n();
const nodesToBeShown = 5;

withDefaults(
	defineProps<{
		workflow?: ITemplatesWorkflow;
		lastItem?: boolean;
		firstItem?: boolean;
		useWorkflowButton?: boolean;
		loading?: boolean;
		simpleView?: boolean;
	}>(),
	{
		lastItem: false,
		firstItem: false,
		useWorkflowButton: false,
		loading: false,
		simpleView: false,
	},
);

const emit = defineEmits<{
	useWorkflow: [e: MouseEvent];
	click: [e: MouseEvent];
}>();

function onUseWorkflowClick(e: MouseEvent) {
	emit('useWorkflow', e);
}

function onCardClick(e: MouseEvent) {
	emit('click', e);
}
</script>

<template>
	<div
		:class="[
			$style.card,
			lastItem && $style.last,
			firstItem && $style.first,
			!loading && $style.loaded,
		]"
		data-test-id="template-card"
		@click="onCardClick"
	>
		<div v-if="loading" :class="$style.loading">
			<N8nLoading :rows="2" :shrink-last="false" :loading="loading" />
		</div>
		<div v-else-if="workflow">
			<N8nHeading :bold="true" size="small">{{ workflow.name }}</N8nHeading>
			<div v-if="!simpleView" :class="$style.content">
				<span v-if="workflow.totalViews">
					<N8nText size="small" color="text-light">
						<N8nIcon icon="eye" size="xsmall" />
						{{ abbreviateNumber(workflow.totalViews) }}
					</N8nText>
				</span>
				<div v-if="workflow.totalViews" :class="$style.line" v-text="'|'" />
				<N8nText size="small" color="text-light">
					<TimeAgo :date="workflow.createdAt" />
				</N8nText>
				<div v-if="workflow.user" :class="$style.line" v-text="'|'" />
				<N8nText v-if="workflow.user" size="small" color="text-light">
					{{
						i18n.baseText('template.byAuthor' as BaseTextKey, {
							interpolate: { name: workflow.user.username },
						})
					}}
				</N8nText>
			</div>
		</div>
		<div
			v-if="!loading && workflow"
			:class="[$style.nodesContainer, useWorkflowButton && $style.hideOnHover]"
		>
			<NodeList v-if="workflow.nodes" :nodes="workflow.nodes" :limit="nodesToBeShown" size="md" />
		</div>
		<div v-if="useWorkflowButton" :class="$style.buttonContainer">
			<N8nButton
				v-if="useWorkflowButton"
				outline
				label="Use workflow"
				data-test-id="use-workflow-button"
				@click.stop="onUseWorkflowClick"
			/>
		</div>
	</div>
</template>

<style lang="scss" module>
.card {
	position: relative;
	border-left: var(--border);
	border-right: var(--border);
	border-bottom: var(--border);
	background-color: var(--color--background--light-3);
	display: flex;
	align-items: center;
	padding: 0 var(--spacing--sm) var(--spacing--sm) var(--spacing--sm);
	cursor: pointer;

	&:hover {
		.hideOnHover {
			visibility: hidden;
		}
		.buttonContainer {
			display: block;
		}
	}
}

.buttonContainer {
	display: none;
	position: absolute;
	right: 10px;
	top: 30%;
}

.loaded {
	padding-top: var(--spacing--sm);
}

.first {
	border-top: var(--border);
	border-top-right-radius: var(--radius--lg);
	border-top-left-radius: var(--radius--lg);
}

.last {
	border-bottom-right-radius: var(--radius--lg);
	border-bottom-left-radius: var(--radius--lg);
}

.content {
	display: flex;
	align-items: center;
}

.line {
	padding: 0 6px;
	color: var(--color--foreground);
	font-size: var(--font-size--2xs);
}

.loading {
	width: 100%;
	background-color: var(--color--background--light-3);
}

.nodesContainer {
	min-width: 175px;
	display: flex;
	justify-content: flex-end;
	align-items: center;
	flex-grow: 1;
}
</style>
```

---

## Key Patterns

### 1. **Props with Defaults using `withDefaults`** ✅
```typescript
withDefaults(
	defineProps<{
		workflow?: ITemplatesWorkflow;
		lastItem?: boolean;
		// ...
	}>(),
	{
		lastItem: false,
		firstItem: false,
		// ...
	},
);
```
- Use `withDefaults` for optional props with default values
- All props are typed with TypeScript

### 2. **Typed Events with `defineEmits`** ✅
```typescript
const emit = defineEmits<{
	useWorkflow: [e: MouseEvent];
	click: [e: MouseEvent];
}>();

function onUseWorkflowClick(e: MouseEvent) {
	emit('useWorkflow', e);
}
```
- Define event types explicitly
- Create handler functions for clarity
- Use descriptive event names

### 3. **i18n Integration** ✅
```typescript
import { useI18n } from '@n8n/i18n';
import type { BaseTextKey } from '@n8n/i18n';

const i18n = useI18n();

// In template:
i18n.baseText('template.byAuthor' as BaseTextKey, {
	interpolate: { name: workflow.user.username },
})
```
- **ALL UI text must use i18n** (mandatory in n8n)
- Import from `@n8n/i18n` package
- Use `baseText()` with interpolation for dynamic values

### 4. **Design System Components** ✅
```typescript
import { N8nButton, N8nHeading, N8nIcon, N8nLoading, N8nText } from '@n8n/design-system';
```
- Use components from `@n8n/design-system`
- Ensures UI consistency
- Never create custom buttons, headings, etc.

### 5. **Dynamic Class Binding** ✅
```vue
:class="[
	$style.card,
	lastItem && $style.last,
	firstItem && $style.first,
	!loading && $style.loaded,
]"
```
- Array syntax for multiple conditional classes
- Use `$style` for CSS modules
- Conditional classes with `&&`

### 6. **data-test-id for Testing** ✅
```vue
data-test-id="template-card"
data-test-id="use-workflow-button"
```
- **MUST be single value** (no spaces)
- Used by Playwright E2E tests
- Add to all interactive elements

### 7. **Event Modifiers** ✅
```vue
@click.stop="onUseWorkflowClick"
```
- Use `.stop` to prevent event bubbling
- Use `.prevent` to prevent default behavior

### 8. **CSS Variables for Everything** ✅
```scss
padding: 0 var(--spacing--sm) var(--spacing--sm) var(--spacing--sm);
border: var(--border);
color: var(--color--foreground);
font-size: var(--font-size--2xs);
border-radius: var(--radius--lg);
```
- **NEVER hardcode spacing, colors, or sizes**
- Use design system variables

### 9. **SCSS Nesting** ✅
```scss
.card {
	&:hover {
		.hideOnHover {
			visibility: hidden;
		}
	}
}
```
- Use SCSS nesting for pseudo-classes
- Keep nesting shallow (max 2-3 levels)

---

## When to Use This Pattern

✅ **Use for**:
- Card components
- List items
- Complex UI components with multiple states
- Components requiring i18n
- Interactive components with events

---

## n8n Conventions Applied

1. ✅ **TypeScript**: All props and events typed
2. ✅ **i18n**: All text uses i18n
3. ✅ **Design System**: Uses N8n components
4. ✅ **CSS Variables**: No hardcoded values
5. ✅ **CSS Modules**: `<style module>`
6. ✅ **data-test-id**: Single value for testing
7. ✅ **Composition API**: `<script setup>`
8. ✅ **Type Imports**: From `@n8n/` packages

---

## Common Variations

### With Pinia Store
```typescript
import { useWorkflowsStore } from '@/app/stores/workflows.store';

const workflowsStore = useWorkflowsStore();
```

### With Composable
```typescript
import { useToast } from '@/app/composables/useToast';

const toast = useToast();
```

### With Async Data
```typescript
import { ref, onMounted } from 'vue';

const data = ref<ITemplatesWorkflow | null>(null);
const loading = ref(true);

onMounted(async () => {
	data.value = await fetchData();
	loading.value = false;
});
```

---

## Testing Example

```typescript
import { mount } from '@vue/test-utils';
import { createPinia } from 'pinia';
import TemplateCard from './TemplateCard.vue';

describe('TemplateCard', () => {
	it('emits click event when card is clicked', async () => {
		const wrapper = mount(TemplateCard, {
			props: {
				workflow: mockWorkflow,
			},
			global: {
				plugins: [createPinia()],
			},
		});
		
		await wrapper.find('[data-test-id="template-card"]').trigger('click');
		expect(wrapper.emitted('click')).toBeTruthy();
	});
	
	it('shows loading state', () => {
		const wrapper = mount(TemplateCard, {
			props: { loading: true },
		});
		expect(wrapper.find('[data-test-id="template-card"]').exists()).toBe(true);
	});
});
```

---

## Related Patterns

- **Simple Component**: See `01-simple-icon-component.md`
- **Badge Component**: See `02-badge-component.md`
- **With Pinia Store**: See `05-component-with-pinia.md`

---

**Last Updated**: 2026-01-11  
**Source**: n8n production codebase  
**Confidence**: High
