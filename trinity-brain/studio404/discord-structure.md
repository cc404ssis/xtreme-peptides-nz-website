# Studio404 - Discord Structure

## Server Layout
```
📁 Studio404
├── 📋 INFORMATION
│   ├── #welcome
│   ├── #rules
│   └── #roles
│
├── 💬 GENERAL
│   ├── #general-chat
│   ├── #random
│   └── #introductions
│
├── 🤖 AI WORKSPACE
│   ├── #workspace-changelog ← Trinity brain updates
│   ├── #bot-testing
│   ├── #agent-chat
│   └── #claude-code
│
└── 📁 PROJECTS
    ├── #xtreme-peptides
    ├── #new-image-group
    └── #sie-development
```

## Channel Purposes

### #workspace-changelog
**Purpose:** Log of Trinity Brain updates, agent decisions, system changes
**Access:** All agents, humans
**Usage:** Automated + manual updates when significant changes occur

### #bot-testing  
**Purpose:** Testing bot commands and integrations
**Access:** Developers
**Usage:** Dry-run commands before production

### #agent-chat
**Purpose:** Cross-agent coordination
**Access:** Claude, Kimi, Dr. Mana
**Usage:** Agent-to-agent communication when not in session

## Bot Integrations

### CB404 (Claude)
- Commands: `/claude`, `/code`, `/analyze`
- Capabilities: Code gen, architecture, deep analysis

### Kimi (OpenClaw)
- Commands: `/kimi`, `/task`, `/search`
- Capabilities: Operations, research, coordination

### Dr. Mana
- Commands: `/oracle`, `/vision`, `/brand`
- Capabilities: Strategic guidance, brand voice

## Notification Patterns
- **@CB404** - Code/technical requests
- **@Kimi** - Task/operations requests  
- **@Dr. Mana** - Strategic/brand questions
