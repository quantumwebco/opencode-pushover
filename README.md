# OpenCode Pushover Plugin

A plugin for [OpenCode](https://opencode.ai) that sends Pushover notifications when your coding sessions become idle.

## Features

- Send notifications via Pushover when OpenCode sessions go idle
- Customizable message, title, and priority
- Support for attachments (images and files)
- Configurable notification sounds and devices
- HTML message support
- URL attachments with custom titles

## Installation

1. Install the plugin via npm:
   ```bash
   npm install opencode-pushover
   ```

2. Add the plugin to your OpenCode configuration.

## Configuration

You can configure the plugin in several ways, in order of precedence (later sources override earlier ones):

1. Local `.pushover.env` file in the plugin directory (for local development)
2. Global `~/.config/opencode/.env` file
3. Environment variables in `~/.config/opencode/opencode.jsonc` under the `env` key
4. Plugin configuration in `~/.config/opencode/opencode.jsonc` under `plugins.opencode-pushover`
5. Local `opencode-pushover.json` file in the plugin directory

### Environment Variables

Set your Pushover credentials in one of the following ways:

**Option 1: Local .env file (for development)**
Create a `.pushover.env` file in the plugin directory:
```
PUSHOVER_USER=your_user_key
PUSHOVER_TOKEN=your_app_token
```

**Option 2: Global .env file**
Create or add to `~/.config/opencode/.env`:
```
PUSHOVER_USER=your_user_key
PUSHOVER_TOKEN=your_app_token
```

**Option 3: Global config file**
Add to `~/.config/opencode/opencode.jsonc`:
```jsonc
{
  "env": {
    "PUSHOVER_USER": "your_user_key",
    "PUSHOVER_TOKEN": "your_app_token"
  }
}
```

### Optional Configuration

Configure notifications in one of the following ways:

**Option 1: Local config file (for development)**
Edit `opencode-pushover.json` in the plugin directory:

**Option 2: Global config file**
Add to `~/.config/opencode/opencode.jsonc`:
```jsonc
{
  "plugins": {
    "opencode-pushover": {
      "message": "OpenCode has finished!",
      "title": "OpenCode Session Complete",
      "priority": 0,
      "sound": "spacealarm",
      "html": 0,
      "device": null,
      "attachment": null,
      "attachment_base64": null,
      "attachment_type": null,
      "timestamp": null,
      "ttl": null,
      "url": null,
      "url_title": null
    }
  }
}
```

```json
{
  "message": "OpenCode has finished!",
  "title": "OpenCode Session Complete",
  "priority": 0,
  "sound": "spacealarm",
  "html": 0,
  "device": null,
  "attachment": null,
  "attachment_base64": null,
  "attachment_type": null,
  "timestamp": null,
  "ttl": null,
  "url": null,
  "url_title": null
}
```

### Configuration Options

- `message`: Notification message (default: "OpenCode has finished!")
- `title`: Notification title
- `priority`: Message priority (-2 to 2, default: 0)
- `sound`: Notification sound (see Pushover docs for options)
- `html`: Enable HTML formatting (1 for enabled, 0 for disabled)
- `device`: Target specific device
- `attachment`: Path to attachment file
- `attachment_base64`: Base64-encoded attachment data
- `attachment_type`: MIME type for base64 attachment
- `timestamp`: Unix timestamp for message
- `ttl`: Message time-to-live in seconds
- `url`: URL to include with message
- `url_title`: Title for the URL

## Supported Attachment Types

The plugin automatically detects MIME types for common image formats:
- `.jpg`, `.jpeg` → `image/jpeg`
- `.png` → `image/png`
- `.gif` → `image/gif`
- `.webp` → `image/webp`
- `.bmp` → `image/bmp`

For other file types, specify `attachment_type` in the configuration.

## Usage

Once configured, the plugin will automatically send Pushover notifications whenever an OpenCode session becomes idle.

## License

ISC