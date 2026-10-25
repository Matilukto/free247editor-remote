---
name: free247editor-remote
description: Edit videos while the user is away from their computer, through a cloud folder synced to it (Google Drive for desktop, Dropbox, OneDrive, iCloud Drive). The user uploads raw clips from their phone, the agent picks them up from the synced folder, edits them with the open-source free247editor skill, shows the storyboard and questions on the phone, and saves the finished video back into the same folder so it syncs to the cloud. Use for setting up remote or phone editing, "nasa labas ako", "nag-upload ako sa Drive", "edit mo yung nasa Google Drive", a new video in the Drive or cloud folder, a Drive link, or checking whether uploads to the folder work. Pair with the free247editor skill, which does the edit itself.
---

# free247editor-remote: edit from your phone through a synced cloud folder

The user records on their phone, uploads to a cloud folder, and talks to you from their
phone while you run on their computer. You pick the video up from that folder, edit it with
the `free247editor` skill, show them the storyboard on the phone, and put the finished video
back in the folder. The cloud app on the computer syncs it to their phone.

This skill is built on free247editor (https://github.com/riecodes/free247editor, open source,
MIT) and only adds the remote parts. Its skill, `.agents/skills/free247editor/SKILL.md`, owns
the edit itself: questions, cut, captions, graphics, storyboard, render, notes, and quality
checks. Follow it for the editing, and follow this skill for where files come from and go.
That skill says never to upload a video anywhere. This skill makes one exception: saving
drafts into the user's own synced folder, which they set up for exactly that.

Talk in the user's language (English, Tagalog, Taglish), in short plain words. They are on a
phone, so keep messages short, ask in multiple choice when you can, and don't make them type
paths or commands.

## Why a synced folder, not a connector

A raw phone video is 50 to 700 MB. Connectors and chat tools pass file content through the
conversation as text (base64), which fails or floods the context at that size. A desktop sync
app turns the cloud folder into an ordinary folder on disk, so you read and write the videos
with normal file tools, at full speed. A connector for the same service is still useful:
confirming a file reached the cloud and getting its link. Never use it to move video bytes.

## Before the first remote edit: three checks

Run these in order the first time, when the user asks to set up remote editing, or when
something is missing. Each one is quick when it is already done. Report the results in a few
bullets, fix what is missing with the user's OK, and only then edit.

### 1. free247editor is installed and ready

- **Is this the free247editor folder?** Look for `setup.mjs` and
  `.agents/skills/free247editor/SKILL.md`, and check where it came from with
  `git remote -v`. It should be `https://github.com/riecodes/free247editor` or a fork of it.
  If the user has only this skill and not the editor, offer to clone that repo (install Git
  first if it is missing, after asking), copy this skill's folder into its
  `.agents/skills/`, copy the short pointer from `.claude/skills/free247editor-remote/` in
  this skill's repo (https://github.com/Matilukto/free247editor-remote) into its
  `.claude/skills/`, and continue from the free247editor folder.
- **Are the essentials there?** Run `node setup.mjs`. It is safe to re-run: it checks Node 22+,
  Git, FFmpeg, and the editing engine in `kit/`, skips what is already installed, and ends
  with `SETUP COMPLETE` plus whether transcription (Groq key or local faster-whisper) is set.
  If it stops or says transcription is not configured, follow the free247editor skill's
  "start" steps to fix it. Do not start a remote edit until setup completes with
  transcription, because a phone user can't fix a broken install from outside.

### 2. A cloud folder syncs to this computer

- **Which sync apps are here?** Run `node .agents/skills/free247editor-remote/scripts/remote-folder.mjs --apps`. It lists the cloud
  apps that have a folder on this computer: Google Drive for desktop (a drive letter with
  `My Drive` on Windows, `~/Library/CloudStorage/...` on macOS), Dropbox, OneDrive, and iCloud
  Drive.
- **None, or not the one they want?** Ask which cloud service they use on their phone, as
  multiple choice: Google Drive, Dropbox, OneDrive, iCloud Drive, or other. Then help them
  install that service's desktop app and sign in themselves (never type their password):
  - Google Drive: Google Drive for desktop, https://www.google.com/drive/download/ (Windows,
    macOS). On Linux, an `rclone mount` of the Drive folder works the same way.
  - Dropbox: https://www.dropbox.com/install
  - OneDrive: built into Windows; on macOS, from the App Store.
  - iCloud Drive: built into macOS; on Windows, iCloud for Windows.
  - Other: it works if the service has a desktop app that syncs a real folder to disk. If it
    only has a website, say this setup can't work with it and suggest one of the above.
- **Pick the folder.** Ask for the folder's name (for example `Claude video edit`), or offer to
  create one inside the synced root so it appears on their phone. Then:
  `node .agents/skills/free247editor-remote/scripts/remote-folder.mjs --find "<name>"` and
  `node .agents/skills/free247editor-remote/scripts/remote-folder.mjs --set "<path>"`. This writes `REMOTE_FOLDER` to `.env`, which
  is gitignored.
- **Is there a connector for that service?** Check your own tools for one that can search or
  list files in that cloud service (a Google Drive, Dropbox, or OneDrive connector or MCP
  server). If there is one, you will use it to confirm uploads and to get share links. If
  there is none, you can still do everything; you will ask the user to check uploads in the
  app on their phone instead. Tell them which case applies, and that they can add the
  connector in their agent's settings if they want links sent to them.
- **Test a real upload.** `node .agents/skills/free247editor-remote/scripts/remote-folder.mjs --test` writes a small text file into
  the folder. Confirm it is online through the connector, or ask the user to look on their
  phone. Only say uploads work once it is confirmed online. Writing to the local folder alone
  does not prove that the sync works. Offer to delete the test file afterwards.

### 3. The user can reach you from their phone

You run on the computer, so the user needs a way to reach this same session from their phone.
Work out whether the agent you are running in can do it, and say so plainly.

| Agent | How the user reaches it from the phone |
| --- | --- |
| Claude Code in the Claude desktop app | Open the same session in the Claude mobile app. File sends and multiple choice questions show up there. |
| Claude Code in a terminal | Remote Control, if their version has it; otherwise a remote desktop app. |
| Codex, Cursor, Gemini CLI, GitHub Copilot, Windsurf, OpenCode, and others | The agent's own remote or mobile option, if it has one that drives this computer's session. |
| Any agent, as a fallback | A remote desktop app (for example Chrome Remote Desktop) to type into the agent on the computer. |

Also check what you can send back to the phone:

- **Files:** do you have a tool that sends a file into the chat (in the Claude app,
  `SendUserFile`)? If not, you will write previews into the cloud folder instead.
- **Questions:** do you have a multiple choice question tool? If not, list options as A, B, C
  so they can answer with one letter.

If none of these works with the user's agent, don't force it: say what is missing and suggest
the closest option that does work with their agent, such as the remote desktop fallback, or
switching to an agent with a mobile app for remote days. An agent that only runs in a hosted
cloud sandbox can't see this computer's folder or editing engine, so it can't do this; suggest
running it locally.

## Editing a video from the folder

1. **Find it.** `node .agents/skills/free247editor-remote/scripts/remote-folder.mjs` lists the videos newest first and marks your own
   `-v1`/`-final` outputs. Take the file they name, or the newest raw ones. Several clips sent
   for "one video" become one project, joined in the order they give. If you're not sure which,
   show the list and ask. A file missing from the list may still be syncing, so wait a minute
   and list again before saying it is not there.
2. **Copy; never touch the original.** Transcode from the synced path into the project, as the
   free247editor skill says. The first read of a big file can be slow because the sync app
   downloads it on demand. That is normal: run it in the background and tell the user it is
   downloading.
3. **Edit with the free247editor skill**, step by step, up to its storyboard.
4. **Show the storyboard on the phone and wait.** Send the storyboard page with your file tool.
   Without one, copy its contact sheet (`qa/storyboard/contact-sheet.jpg`) into the cloud
   folder as `<slug>-storyboard.jpg` and tell them to open it there. Ask the free247editor
   questions as multiple choice. If they answer with a request instead (send the transcript,
   fix a word), do that first. A request is not a "go".
5. **Render only on "go".** Copy the draft to `outbox/<slug>-v1.mp4` and into the cloud folder
   under the same name. Never overwrite or rename their raw files.
6. **Confirm it is online before you give a link.** A 50 MB draft takes about a minute to
   upload. With a connector, search for the exact file name until it appears, then give its
   link. Without one, say it is in the folder and syncing, and ask them to check. Wait in the
   background or with a short scheduled check rather than holding the turn.
7. **Report in 3 to 5 bullets:** the link, the length before and after, and what you changed.
   Say what you checked and what you didn't.
8. **Notes become `-v2`, `-v3`,** saved to the folder the same way. Keep earlier versions so
   they can compare. When they say it is done and not to render or upload again, stop: the
   last draft is the final.

## Quality checks

Run the free247editor skill's checks. The user can't scrub the timeline with you or look over
your shoulder, so lean on them harder than usual: check the encoded draft itself (its audio as
well as stills), list every doubt in the storyboard before the render, and never call a draft
checked beyond what you actually checked.

## Never

- Move video bytes through a chat or a connector.
- Overwrite, rename, move, or delete the user's raw files or anything else in the folder,
  except a test file they agree to remove.
- Upload anywhere except the user's own folder, or share or post a video.
- Say an upload worked before you have seen it online, or say you watched a video you only
  sampled.
- Sign in to the user's accounts or type their passwords.
