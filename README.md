# m-discord

A Discord bot that generates chat resumes for group channels based on specified date ranges.

## Features

- 📊 Generate comprehensive chat statistics for any date range
- 👥 Track unique users and top contributors
- 📎 Count media attachments, images, videos, and links
- 📅 Identify most active days
- 🔍 Works with any channel (with proper permissions)

## Prerequisites

- Node.js 16.9.0 or higher
- A Discord Bot Token and Client ID

## Setup

### 1. Create a Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section and click "Add Bot"
4. Under the bot's username, click "Reset Token" and copy your bot token
5. Enable these Privileged Gateway Intents:
   - MESSAGE CONTENT INTENT
6. Go to the "OAuth2" section and copy your Client ID
7. Go to "OAuth2" > "URL Generator":
   - Select scopes: `bot`, `applications.commands`
   - Select bot permissions: `Read Messages/View Channels`, `Send Messages`, `Read Message History`
   - Copy the generated URL and open it in your browser to invite the bot to your server

### 2. Install the Bot

1. Clone this repository:
   ```bash
   git clone https://github.com/tumusx/m-discord.git
   cd m-discord
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` and add your bot credentials:
   ```
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   ```

### 3. Deploy Commands

Deploy the slash commands to Discord:
```bash
npm run deploy
```

### 4. Start the Bot

```bash
npm start
```

You should see: `✅ Bot is ready! Logged in as YourBot#1234`

## Usage

### `/chatresume` Command

Generate a chat resume for a specific date range.

**Parameters:**
- `start_date` (required): Start date in YYYY-MM-DD format
- `end_date` (required): End date in YYYY-MM-DD format
- `start_time` (optional): Start time in HH:MM format (defaults to 00:00)
- `end_time` (optional): End time in HH:MM format (defaults to 23:59)
- `channel` (optional): Channel to analyze (defaults to current channel)

**Examples:**

```
/chatresume start_date:2024-01-01 end_date:2024-01-31
```

Get resume for January 2024 in the current channel.

```
/chatresume start_date:2024-01-01 end_date:2024-01-07 channel:#general
```

Get resume for the first week of January 2024 in #general channel.

```
/chatresume start_date:2024-01-15 end_date:2024-01-15 start_time:09:00 end_time:17:00
```

Get resume for January 15, 2024, from 9 AM to 5 PM (business hours).

```
/chatresume start_date:2024-01-01 end_date:2024-01-31 start_time:18:00 end_time:23:59
```

Get resume for evening messages (6 PM to midnight) during January 2024.

### Output

The bot will post the resume directly to the channel as a message, including:
- 📅 Date range analyzed
- 💬 Total message count
- 👥 Number of unique users
- 🏆 Top contributors (up to 10 users)
- 📎 Media statistics (attachments, images, videos, links)
- 📊 Most active days (top 5)

The user who invoked the command will receive a confirmation message.

## Permissions

The bot needs the following permissions:
- Read Messages/View Channels
- Send Messages
- Read Message History

## Troubleshooting

**Bot doesn't respond to commands:**
- Make sure you ran `npm run deploy` to register commands
- Verify the bot has proper permissions in the channel
- Check that MESSAGE CONTENT INTENT is enabled in Discord Developer Portal

**"I don't have permission to read message history":**
- The bot needs "Read Message History" permission in the target channel

**"I don't have permission to send messages in that channel":**
- The bot needs "Send Messages" permission in the target channel to post the resume

**Invalid date format error:**
- Dates must be in YYYY-MM-DD format (e.g., 2024-01-15)
- Start date must be before end date
- End date cannot be in the future

**Invalid time format error:**
- Times must be in HH:MM format (e.g., 09:30, 14:45)
- Use 24-hour format (00:00 to 23:59)
- Times are optional and default to 00:00 (start) and 23:59 (end)

## Development

The project structure:
```
m-discord/
├── commands/
│   └── chatresume.js    # Chat resume command implementation
├── index.js             # Main bot file
├── deploy-commands.js   # Command deployment script
├── .env.example         # Environment variables template
├── .gitignore          # Git ignore file
└── package.json        # Node.js dependencies
```

## License

ISC