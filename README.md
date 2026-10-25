# free247editor-remote

**Edit your videos from your phone, even when you're away from your computer.**

Upload a raw clip to Google Drive (or Dropbox, OneDrive, iCloud Drive) from your phone, then
message your AI agent. Your computer at home picks up the video, edits it with
[free247editor](https://github.com/riecodes/free247editor), sends you a storyboard to approve,
and saves the finished video back to the same folder. Watch it on your phone in the Drive app.

An add-on skill for free247editor. Works with AI coding agents that support
[Agent Skills](https://agentskills.io): Claude Code, Codex, Cursor, Antigravity, Gemini CLI,
GitHub Copilot, Windsurf, OpenCode, and others.

## How it works

```
 Phone                         Cloud folder                     Your computer
 ─────                         ────────────                     ─────────────
 1. Upload IMG_1234.MOV  ──▶   Claude video edit/   ──sync──▶   2. Agent copies the video and
                                                                   edits it with free247editor
 3. Approve the storyboard ◀──────── chat with your agent ──────── (questions + real stills)
 5. Watch img1234-v1.mp4  ◀──  Claude video edit/   ◀──sync──   4. Agent saves the edited video
```

Videos travel through a folder that your cloud app syncs to your computer, never through the
chat. Raw phone videos are 50 to 700 MB, too big for chat or connector uploads, but a synced
folder handles them at full speed.

## What you need

- **[free247editor](https://github.com/riecodes/free247editor), set up** on your computer
  (it installs Node.js, Git, FFmpeg, the editing engine, and free transcription for you).
- **A cloud app that syncs a folder to your computer:**
  [Google Drive for desktop](https://www.google.com/drive/download/),
  [Dropbox](https://www.dropbox.com/install), OneDrive, or iCloud Drive.
- **A way to message your agent from your phone.** With Claude Code in the Claude desktop app,
  open the same session in the Claude mobile app. With other agents, use their remote or
  mobile option, or a remote desktop app such as Chrome Remote Desktop.
- **The computer on, awake, and online** while you're away.

An agent that runs only in the cloud (in a hosted sandbox) can't see your computer's folder,
so it can't do this. Run your agent on your own computer.

## Setup, step by step

### 1. Install free247editor and this skill with one prompt

Open your AI agent (for example `claude` or `codex` in a terminal, or a new chat in Cursor)
and paste:

```text
Set up remote video editing for me with free247editor-remote.
1. If I don't have free247editor yet, clone https://github.com/riecodes/free247editor.git into
   my Documents folder (install Git first if it is missing, after asking me), and follow the
   "start" steps in its skill, .agents/skills/free247editor/SKILL.md.
2. Download https://github.com/Matilukto/free247editor-remote and copy its
   .agents/skills/free247editor-remote folder into free247editor's .agents/skills/, and its
   .claude/skills/free247editor-remote folder into free247editor's .claude/skills/.
3. Follow the setup checks in .agents/skills/free247editor-remote/SKILL.md.
When you finish, remind me to open my agent in the free247editor folder from now on.
```

Already have free247editor? The same prompt works: it skips step 1.

### 2. Or add the skill by hand

Download this repo (*Code > Download ZIP*), then copy the two folders into your
free247editor folder:

| From this repo | Into your free247editor folder |
| --- | --- |
| `.agents/skills/free247editor-remote/` | `.agents/skills/` |
| `.claude/skills/free247editor-remote/` | `.claude/skills/` (Claude Code only reads skills from here) |

### 3. Install your cloud app

Install Google Drive for desktop (or Dropbox, OneDrive, iCloud Drive) on the computer and sign
in. In the cloud, make a folder for your videos, for example `Claude video edit`.

### 4. Let the agent check everything (the one-prompt setup does this for you)

Tell your agent: **"set up remote editing with my Drive folder Claude video edit"**. It runs
three checks and fixes what is missing (it asks you first):

1. **free247editor:** that the folder came from the free247editor repo and that setup is
   complete, including transcription.
2. **Cloud:** which cloud app is on the computer (it asks which one you want if there are none),
   where your folder is, and whether your agent has a connector for that cloud, which lets it
   send you links. Then it uploads a small test file. Check that it appears on your phone.
3. **Phone:** whether you can reach the agent from your phone and whether it can send you
   files and multiple-choice questions there. If not, it suggests a way that works with your
   agent.

### 5. Test it away from home

Upload a short clip from your phone, then message your agent from your phone:
**"nag-upload ako, edit mo yung IMG_1234"** (or in English: "I uploaded a video, edit
IMG_1234").

## Editing from your phone

1. Upload your clips to the folder.
2. Tell your agent which video, or which clips to join into one video.
3. Answer a few multiple-choice questions: format, captions, hook, sound.
4. Look at the storyboard of real stills from your video. Correct anything, ask for the
   transcript, then say **"go"**.
5. Watch `<name>-v1.mp4` in the same folder. Give notes and you get `-v2`, `-v3`. Say
   **"ok na"** when you're happy.

## What the agent will and won't do

| It will | It won't |
| --- | --- |
| Copy your video before editing it | Touch, rename, move, or delete your raw files |
| Save each edit as a new file (`-v1`, `-v2`) | Overwrite an earlier version |
| Confirm an upload is online before saying so | Upload anywhere except your own folder |
| Ask before installing anything | Sign in for you or type your passwords |
| Say what it checked and what it didn't | Post or share your videos |

## Files

```
free247editor-remote/
  .agents/skills/free247editor-remote/
    SKILL.md                  the skill: setup checks, remote editing, rules
    scripts/remote-folder.mjs finds your synced folder, lists videos, tests uploads
  .claude/skills/free247editor-remote/
    SKILL.md                  pointer for Claude Code
```

The folder path is saved as `REMOTE_FOLDER` in free247editor's `.env`, which stays on your
computer.

## Credits

- **[free247editor](https://github.com/riecodes/free247editor)** by rieCodes (MIT): the
  open-source video editor skill this is built on. All the editing is theirs; this repo only
  adds the remote, phone, and cloud folder parts.
- **[Herk Edit Kit](https://github.com/nateherkai/herk-edit-kit)** by Nate Herk (MIT): the
  editing engine inside free247editor, built on
  **[HyperFrames](https://github.com/heygen-com/hyperframes)** by HeyGen and
  **[GSAP](https://gsap.com/)**.
- **Transcription:** [Groq](https://console.groq.com/) (free tier) or
  [faster-whisper](https://github.com/SYSTRAN/faster-whisper).
- **[Agent Skills](https://agentskills.io):** the open format that lets one skill work in many
  agents.
- Written with [Claude Code](https://claude.com/claude-code).

Google Drive, Dropbox, OneDrive, and iCloud are trademarks of their owners. This project is
not affiliated with them, with Nate Herk or HeyGen, or with any AI agent maker.

## License

MIT. See [LICENSE](LICENSE).
