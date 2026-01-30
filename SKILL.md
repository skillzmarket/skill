---
name: skillzmarket
description: Call monetized AI skills from the Skillz Market with automatic USDC payments
homepage: https://skillz.market
user-invocable: true
command-dispatch: tool
command-tool: Bash
command-arg-mode: raw
metadata: {"openclaw":{"requires":{"bins":["npx"],"env":["SKILLZ_PRIVATE_KEY"]},"primaryEnv":"SKILLZ_PRIVATE_KEY"}}
---

# Skillz Market

Search and call monetized AI skills with automatic cryptocurrency payments.

## Commands

### Search for skills
```
/skillzmarket search <query>
```

### Get skill details
```
/skillzmarket info <slug>
```

### Call a skill (with payment)
```
/skillzmarket call <slug> <json_input>
```

### Call endpoint directly
```
/skillzmarket direct <url> <json_input>
```

## Examples

Search for translation skills:
```
/skillzmarket search translate
```

Call the echo skill:
```
/skillzmarket call echo {"message": "hello"}
```

## Configuration

Set `SKILLZ_PRIVATE_KEY` in your OpenClaw config to enable payments:
```json
{
  "skills": {
    "entries": {
      "skillzmarket": {
        "apiKey": "0x..."
      }
    }
  }
}
```
