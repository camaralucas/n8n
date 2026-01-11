# Example: Modal Component with Pinia Store (Vue 3)

**File**: `packages/frontend/editor-ui/src/features/workflows/workflowHistory/components/WorkflowHistoryVersionUnpublishModal.vue`

**Category**: Frontend - Vue 3 Component with State Management  
**Complexity**: Advanced  
**Pattern**: Component with Pinia Store, Event Bus, Lifecycle Hooks

---

## Purpose

A modal component that demonstrates integration with Pinia store for UI state management, event bus for parent-child communication, and Vue lifecycle hooks. Shows real-world patterns for dialogs and confirmations.

---

## Complete Code (Partial)

```vue
<script lang="ts" setup>
import { ref, onBeforeUnmount } from 'vue';
import { useI18n } from '@n8n/i18n';
import Modal from '@/app/components/Modal.vue';
import { useUIStore } from '@/app/stores/ui.store';
import type { EventBus } from '@n8n/utils/event-bus';
import { N8nButton, N8nHeading, N8nIcon, N8nText } from '@n8n/design-system';

export type WorkflowHistoryVersionUnpublishModalEventBusEvents = {
	unpublish: undefined;
	cancel: undefined;
};

const props = defineProps<{
	modalName: string;
	data: {
		versionName?: string;
		eventBus: EventBus<WorkflowHistoryVersionUnpublishModalEventBusEvents>;
	};
}>();

const i18n = useI18n();
const uiStore = useUIStore();
const unpublishing = ref(false);

const closeModal = () => {
	uiStore.closeModal(props.modalName);
};

const onCancel = () => {
	props.data.eventBus.emit('cancel');
	closeModal();
};

const onUnpublish = () => {
	unpublishing.value = true;
	props.data.eventBus.emit('unpublish');
	// Modal will be closed by parent after API call completes
};

onBeforeUnmount(() => {
	unpublishing.value = false;
});
</script>

<template>
	<Modal width="500px" :name="props.modalName" :before-close="onCancel">
		<template #header>
			<N8nHeading tag="h2" size="xlarge">
				{{
					i18n.baseText('workflowHistory.action.unpublish.modal.title', {
						interpolate: { versionName: props.data.versionName || '' },
					})
				}}
			</N8nHeading>
		</template>
		<template #content>
			<div :class="$style.content">
				<N8nIcon :class="$style.icon" icon="triangle-alert" color="warning" size="xlarge" />
				<N8nText size="medium">
					{{
						i18n.baseText('workflowHistory.action.unpublish.modal.description', {
							interpolate: { versionName: props.data.versionName || '' },
						})
					}}
				</N8nText>
			</div>
		</template>
		<template #footer>
			<div :class="$style.footer">
				<N8nButton size="medium" type="tertiary" :disabled="unpublishing" @click="onCancel">
					{{ i18n.baseText('generic.cancel') }}
				</N8nButton>
				<N8nButton size="medium" type="primary" :loading="unpublishing" @click="onUnpublish">
					{{ i18n.baseText('workflowHistory.action.unpublish.modal.button.unpublish') }}
				</N8nButton>
			</div>
		</template>
	</Modal>
</template>

<style lang="scss" module>
.content {
	display: flex;
	flex-direction: column;
	gap: var(--spacing--md);
	align-items: center;
	text-align: center;
}

.icon {
	margin-bottom: var(--spacing--sm);
}

.footer {
	display: flex;
	justify-content: flex-end;
	gap: var(--spacing--xs);
}
</style>
```

---

## Key Patterns

### 1. **Pinia Store Integration** ✅
```typescript
import { useUIStore } from '@/app/stores/ui.store';

const uiStore = useUIStore();

const closeModal = () => {
	uiStore.closeModal(props.modalName);
};
```
- Import store from `@/app/stores/`
- Call store composable in setup
- Access store methods directly
- Common stores: `useUIStore`, `useWorkflowsStore`, `useSettingsStore`

### 2. **Event Bus Pattern** ✅
```typescript
import type { EventBus } from '@n8n/utils/event-bus';

export type WorkflowHistoryVersionUnpublishModalEventBusEvents = {
	unpublish: undefined;
	cancel: undefined;
};

const props = defineProps<{
	data: {
		eventBus: EventBus<WorkflowHistoryVersionUnpublishModalEventBusEvents>;
	};
}>();

const onUnpublish = () => {
	props.data.eventBus.emit('unpublish');
};
```
- Define event types explicitly
- Use EventBus for parent-child communication
- Type-safe event emissions

### 3. **Reactive State with ref** ✅
```typescript
import { ref } from 'vue';

const unpublishing = ref(false);

const onUnpublish = () => {
	unpublishing.value = true;
	// ...
};
```
- Use `ref()` for reactive primitive values
- Access/modify via `.value`
- Used for loading states, toggles, etc.

### 4. **Lifecycle Hooks** ✅
```typescript
import { onBeforeUnmount } from 'vue';

onBeforeUnmount(() => {
	unpublishing.value = false;
});
```
- Use lifecycle hooks for cleanup
- Common hooks: `onMounted`, `onBeforeUnmount`, `onUnmounted`
- Reset state on unmount

### 5. **Named Slots** ✅
```vue
<Modal>
	<template #header>
		<N8nHeading>...</N8nHeading>
	</template>
	<template #content>
		<!-- ... -->
	</template>
	<template #footer>
		<!-- ... -->
	</template>
</Modal>
```
- Use named slots for flexible layouts
- Common pattern for modals, cards, layouts

### 6. **Button States** ✅
```vue
<N8nButton :disabled="unpublishing" @click="onCancel">
	{{ i18n.baseText('generic.cancel') }}
</N8nButton>
<N8nButton :loading="unpublishing" @click="onUnpublish">
	{{ i18n.baseText('...') }}
</N8nButton>
```
- Use `:disabled` for inactive buttons
- Use `:loading` for async operations
- Prevents double-clicks

### 7. **i18n with Interpolation** ✅
```typescript
i18n.baseText('workflowHistory.action.unpublish.modal.title', {
	interpolate: { versionName: props.data.versionName || '' },
})
```
- Use `interpolate` for dynamic values
- Provide fallback values (`|| ''`)
- Translation keys use dot notation

---

## When to Use This Pattern

✅ **Use for**:
- Modal/dialog components
- Components requiring global state (Pinia)
- Parent-child communication via EventBus
- Async operations with loading states
- Confirmation dialogs

---

## n8n Conventions Applied

1. ✅ **Pinia Store**: For global UI state
2. ✅ **Event Bus**: Type-safe parent-child communication
3. ✅ **i18n**: All text translated with interpolation
4. ✅ **Design System**: N8n components (Button, Heading, Icon, Text)
5. ✅ **Lifecycle Hooks**: Proper cleanup
6. ✅ **Loading States**: Disabled/loading buttons
7. ✅ **CSS Variables**: All spacing and colors
8. ✅ **TypeScript**: Fully typed props and events

---

## Common Pinia Store Patterns

### Accessing Store State
```typescript
import { useWorkflowsStore } from '@/app/stores/workflows.store';

const workflowsStore = useWorkflowsStore();

// Access state
const currentWorkflow = workflowsStore.workflow;

// Access getters
const isWorkflowActive = workflowsStore.isActive;

// Call actions
await workflowsStore.fetchWorkflow(id);
```

### Multiple Stores
```typescript
import { useUIStore } from '@/app/stores/ui.store';
import { useWorkflowsStore } from '@/app/stores/workflows.store';
import { useSettingsStore } from '@/app/stores/settings.store';

const uiStore = useUIStore();
const workflowsStore = useWorkflowsStore();
const settingsStore = useSettingsStore();
```

### Computed from Store
```typescript
import { computed } from 'vue';

const isModalOpen = computed(() => uiStore.modals[props.modalName]?.open);
```

---

## Event Bus Patterns

### Listening to Events
```typescript
// In parent component
const eventBus = createEventBus<WorkflowHistoryVersionUnpublishModalEventBusEvents>();

eventBus.on('unpublish', async () => {
	await handleUnpublish();
	uiStore.closeModal(MODAL_NAME);
});

eventBus.on('cancel', () => {
	console.log('User cancelled');
});
```

### Opening Modal with EventBus
```typescript
uiStore.openModal(MODAL_NAME, {
	versionName: 'v1.0',
	eventBus,
});
```

---

## Testing Example

```typescript
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createEventBus } from '@n8n/utils/event-bus';
import WorkflowHistoryVersionUnpublishModal from './WorkflowHistoryVersionUnpublishModal.vue';

describe('WorkflowHistoryVersionUnpublishModal', () => {
	beforeEach(() => {
		setActivePinia(createPinia());
	});
	
	it('emits unpublish event when button clicked', async () => {
		const eventBus = createEventBus();
		const unpublishSpy = vi.fn();
		eventBus.on('unpublish', unpublishSpy);
		
		const wrapper = mount(WorkflowHistoryVersionUnpublishModal, {
			props: {
				modalName: 'test-modal',
				data: {
					versionName: 'v1.0',
					eventBus,
				},
			},
			global: {
				plugins: [createPinia()],
			},
		});
		
		await wrapper.find('[data-test-id="unpublish-button"]').trigger('click');
		expect(unpublishSpy).toHaveBeenCalled();
	});
});
```

---

## Related Patterns

- **Simple Component**: See `01-simple-icon-component.md`
- **Component with Props**: See `02-badge-component.md`
- **Full Card Component**: See `03-template-card.md`
- **Composables**: See `05-component-with-composable.md`

---

## Common Stores in n8n

| Store | Purpose | Common Methods |
|-------|---------|----------------|
| `useUIStore` | UI state (modals, panels) | `openModal()`, `closeModal()` |
| `useWorkflowsStore` | Workflow data | `fetchWorkflow()`, `saveWorkflow()` |
| `useSettingsStore` | App settings | `getSettings()`, `updateSettings()` |
| `useNodeTypesStore` | Node types catalog | `getNodeType()`, `loadNodeTypes()` |
| `useCredentialsStore` | Credentials | `fetchCredentials()` |

---

**Last Updated**: 2026-01-11  
**Source**: n8n production codebase  
**Confidence**: High
