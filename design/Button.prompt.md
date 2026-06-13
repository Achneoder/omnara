Identity chip for people and the agent. Pass `agent` to render omnara itself (mark on dark with a green ring) — used wherever the AI is the actor.

```jsx
<Avatar name="Dana Reyes" size="md" status />
<Avatar src="/u/dana.jpg" name="Dana Reyes" />
<Avatar agent size="lg" />
```

Sizes `xs | sm | md | lg`. Falls back to initials when `src` is absent.
