import type { Plugin } from "@opencode-ai/plugin"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import { fileURLToPath } from "node:url"
import process from "node:process"
import dotenv from "dotenv"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function guessMime(filePath: string) {
  const ext = path.extname(filePath).toLowerCase()
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg"
    case ".png":
      return "image/png"
    case ".gif":
      return "image/gif"
    case ".webp":
      return "image/webp"
    case ".bmp":
      return "image/bmp"
    default:
      return undefined
  }
}

export default async ({ project, client, $, directory, worktree }) => {
  // Load environment variables from global ~/.config/opencode/.env
  dotenv.config({ path: path.join(os.homedir(), '.config', 'opencode', '.env'), override: false })

  let cfg: any = {}
  // Load default config from opencode-pushover.json
  try {
    cfg = JSON.parse(fs.readFileSync(path.join(__dirname, "opencode-pushover.json"), "utf8"))
  } catch (err) {
    console.error("Failed to load default config", err)
  }

  // Load user config from ~/.config/opencode/opencode-pushover.json
  try {
    const userCfgPath = path.join(os.homedir(), '.config', 'opencode', 'opencode-pushover.json')
    const userCfg = JSON.parse(fs.readFileSync(userCfgPath, 'utf8'))
    // Override default config with user config
    cfg = { ...cfg, ...userCfg }
    // Set env variables from user config if present
    if (userCfg.PUSHOVER_USER) {
      process.env.PUSHOVER_USER = userCfg.PUSHOVER_USER
    }
    if (userCfg.PUSHOVER_TOKEN) {
      process.env.PUSHOVER_TOKEN = userCfg.PUSHOVER_TOKEN
    }
  } catch (err) {
    // Ignore if file doesn't exist or is invalid
  }

  const PUSHOVER_USER = process.env.PUSHOVER_USER
  const PUSHOVER_TOKEN = process.env.PUSHOVER_TOKEN
  const PUSHOVER_MESSAGE = cfg.message ?? "OpenCode has finished!"
  const PUSHOVER_ATTACHMENT = cfg.attachment ?? null
  const PUSHOVER_ATTACHMENT_BASE64 = cfg.attachment_base64 ?? null
  const PUSHOVER_ATTACHMENT_TYPE = cfg.attachment_type ?? null
  const PUSHOVER_DEVICE = cfg.device ?? null
  const PUSHOVER_HTML = cfg.html ?? 0
  const PUSHOVER_PRIORITY = cfg.priority ?? 0
  const PUSHOVER_SOUND = cfg.sound ?? null
  const PUSHOVER_TIMESTAMP = cfg.timestamp ?? null
  const PUSHOVER_TITLE = cfg.title ?? null
  const PUSHOVER_TTL = cfg.ttl ?? null
  const PUSHOVER_URL = cfg.url ?? null
  const PUSHOVER_URL_TITLE = cfg.url_title ?? null

  return {
    event: async ({ event }) => {
      if (event.type === "session.idle") {
        if (!PUSHOVER_USER || !PUSHOVER_TOKEN) {
          console.warn("Pushover user/token not set; skipping notification")
          return
        }

        try {
          const params: Record<string, string> = {
            user: PUSHOVER_USER,
            token: PUSHOVER_TOKEN,
            message: PUSHOVER_MESSAGE,
          }

           if (PUSHOVER_DEVICE) {
             params.device = String(PUSHOVER_DEVICE)
           }
           if (PUSHOVER_HTML === 1 || PUSHOVER_HTML === "1" || PUSHOVER_HTML === true) {
             params.html = "1"
           }
           if (PUSHOVER_PRIORITY !== null && PUSHOVER_PRIORITY !== undefined) {
             params.priority = String(PUSHOVER_PRIORITY)
           }
           if (PUSHOVER_SOUND) {
             params.sound = String(PUSHOVER_SOUND)
           }
           if (PUSHOVER_TIMESTAMP) {
             params.timestamp = String(PUSHOVER_TIMESTAMP)
           }
           if (PUSHOVER_TITLE) {
             params.title = String(PUSHOVER_TITLE)
           }
           if (PUSHOVER_TTL) {
             params.ttl = String(PUSHOVER_TTL)
           }
           if (PUSHOVER_URL) {
             params.url = String(PUSHOVER_URL)
           }
           if (PUSHOVER_URL_TITLE) {
             params.url_title = String(PUSHOVER_URL_TITLE)
           }

          let res: Response

          if (PUSHOVER_ATTACHMENT_BASE64 || PUSHOVER_ATTACHMENT) {
            const form = new FormData()
            for (const [k, v] of Object.entries(params)) form.append(k, v)

            if (PUSHOVER_ATTACHMENT_BASE64) {
              const buffer = Buffer.from(PUSHOVER_ATTACHMENT_BASE64, "base64")
              const mime = PUSHOVER_ATTACHMENT_TYPE ?? "application/octet-stream"
              const blob = new Blob([buffer], { type: mime })
              form.append("attachment", blob, "attachment")
            } else {
              let filePath = PUSHOVER_ATTACHMENT as string
              if (!path.isAbsolute(filePath)) filePath = path.join(__dirname, filePath)
              if (!fs.existsSync(filePath)) {
                console.warn("Pushover attachment not found", filePath)
              } else {
                const buffer = fs.readFileSync(filePath)
                const mime = PUSHOVER_ATTACHMENT_TYPE ?? guessMime(filePath) ?? "application/octet-stream"
                const blob = new Blob([buffer], { type: mime })
                form.append("attachment", blob, path.basename(filePath))
              }
            }

            res = await fetch("https://api.pushover.net/1/messages.json", {
              method: "POST",
              body: form,
            })
          } else {
            res = await fetch("https://api.pushover.net/1/messages.json", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams(params),
            })
          }

          if (!res.ok) {
            const txt = await res.text()
            console.error("Pushover request failed", res.status, txt)
          }
        } catch (err) {
          console.error("Failed to send Pushover notification", err)
        }
      }
    },
  }
}
