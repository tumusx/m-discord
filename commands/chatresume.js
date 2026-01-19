const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chatresume')
        .setDescription('Get a resume of chat messages between two dates')
        .addStringOption(option =>
            option.setName('start_date')
                .setDescription('Start date (format: YYYY-MM-DD)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('end_date')
                .setDescription('End date (format: YYYY-MM-DD)')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel to get resume from (defaults to current channel)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const startDateStr = interaction.options.getString('start_date');
            const endDateStr = interaction.options.getString('end_date');
            const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

            // Validate date format
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (!dateRegex.test(startDateStr) || !dateRegex.test(endDateStr)) {
                return await interaction.editReply('❌ Invalid date format. Please use YYYY-MM-DD format.');
            }

            // Parse dates
            const startDate = new Date(startDateStr + 'T00:00:00Z');
            const endDate = new Date(endDateStr + 'T23:59:59Z');

            // Validate dates
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                return await interaction.editReply('❌ Invalid dates provided.');
            }

            if (startDate > endDate) {
                return await interaction.editReply('❌ Start date must be before end date.');
            }

            if (endDate > new Date()) {
                return await interaction.editReply('❌ End date cannot be in the future.');
            }

            // Check if bot has permission to read message history
            if (!targetChannel.permissionsFor(interaction.client.user).has(PermissionFlagsBits.ReadMessageHistory)) {
                return await interaction.editReply('❌ I don\'t have permission to read message history in that channel.');
            }

            await interaction.editReply(`🔍 Fetching messages from ${targetChannel} between ${startDateStr} and ${endDateStr}...`);

            // Fetch messages
            const messages = await fetchMessagesInDateRange(targetChannel, startDate, endDate);

            if (messages.length === 0) {
                return await interaction.editReply(`No messages found in ${targetChannel} between ${startDateStr} and ${endDateStr}.`);
            }

            // Generate resume
            const resume = generateChatResume(messages, startDate, endDate, targetChannel);

            // Send resume (split if too long)
            if (resume.length <= 2000) {
                await interaction.editReply(resume);
            } else {
                // Split into multiple messages
                const chunks = splitMessage(resume, 2000);
                await interaction.editReply(chunks[0]);
                for (let i = 1; i < chunks.length; i++) {
                    await interaction.followUp(chunks[i]);
                }
            }

        } catch (error) {
            console.error('Error in chatresume command:', error);
            await interaction.editReply('❌ An error occurred while fetching the chat resume. Please try again.');
        }
    },
};

async function fetchMessagesInDateRange(channel, startDate, endDate) {
    const messages = [];
    let lastMessageId;
    let hasMore = true;

    while (hasMore) {
        const options = { limit: 100 };
        if (lastMessageId) {
            options.before = lastMessageId;
        }

        const fetchedMessages = await channel.messages.fetch(options);
        
        if (fetchedMessages.size === 0) {
            hasMore = false;
            break;
        }

        for (const message of fetchedMessages.values()) {
            const messageDate = message.createdAt;
            
            if (messageDate < startDate) {
                hasMore = false;
                break;
            }
            
            if (messageDate >= startDate && messageDate <= endDate) {
                messages.push(message);
            }
        }

        lastMessageId = fetchedMessages.last()?.id;
        
        // Safety check to prevent infinite loops
        if (fetchedMessages.size < 100) {
            hasMore = false;
        }
    }

    return messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
}

function generateChatResume(messages, startDate, endDate, channel) {
    const totalMessages = messages.length;
    const uniqueAuthors = new Set(messages.map(m => m.author.id)).size;
    
    // Count messages by author
    const authorCounts = {};
    messages.forEach(msg => {
        const authorTag = msg.author.tag;
        authorCounts[authorTag] = (authorCounts[authorTag] || 0) + 1;
    });

    // Get top authors
    const topAuthors = Object.entries(authorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([author, count]) => `  • ${author}: ${count} messages`)
        .join('\n');

    // Count media types
    let imagesCount = 0;
    let videosCount = 0;
    let attachmentsCount = 0;
    
    messages.forEach(m => {
        if (m.attachments.size > 0) {
            attachmentsCount++;
            const attachments = Array.from(m.attachments.values());
            if (attachments.some(a => a.contentType?.startsWith('image/'))) {
                imagesCount++;
            }
            if (attachments.some(a => a.contentType?.startsWith('video/'))) {
                videosCount++;
            }
        }
    });
    
    const linksCount = messages.filter(m => m.content.match(/https?:\/\/[^\s]+/)).length;

    // Format dates
    const formatDate = (date) => date.toISOString().split('T')[0];

    let resume = `📊 **Chat Resume for ${channel.name}**\n\n`;
    resume += `📅 **Period:** ${formatDate(startDate)} to ${formatDate(endDate)}\n`;
    resume += `💬 **Total Messages:** ${totalMessages}\n`;
    resume += `👥 **Unique Users:** ${uniqueAuthors}\n\n`;
    
    if (topAuthors) {
        resume += `**Top Contributors:**\n${topAuthors}\n\n`;
    }
    
    resume += `📎 **Media & Links:**\n`;
    resume += `  • Attachments: ${attachmentsCount}\n`;
    resume += `  • Images: ${imagesCount}\n`;
    resume += `  • Videos: ${videosCount}\n`;
    resume += `  • Links: ${linksCount}\n\n`;

    // Activity by day
    const messagesByDay = {};
    messages.forEach(msg => {
        const day = formatDate(msg.createdAt);
        messagesByDay[day] = (messagesByDay[day] || 0) + 1;
    });

    const sortedDays = Object.entries(messagesByDay)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (sortedDays.length > 0) {
        resume += `**Most Active Days:**\n`;
        sortedDays.forEach(([day, count]) => {
            resume += `  • ${day}: ${count} messages\n`;
        });
    }

    return resume;
}

function splitMessage(text, maxLength) {
    const chunks = [];
    let currentChunk = '';

    const lines = text.split('\n');
    for (const line of lines) {
        // Handle case where a single line exceeds maxLength
        if (line.length > maxLength) {
            // Push current chunk if it exists
            if (currentChunk) {
                chunks.push(currentChunk);
                currentChunk = '';
            }
            // Split the long line into smaller pieces
            for (let i = 0; i < line.length; i += maxLength) {
                chunks.push(line.substring(i, i + maxLength));
            }
        } else if (currentChunk.length + line.length + 1 > maxLength) {
            if (currentChunk) {
                chunks.push(currentChunk);
            }
            currentChunk = line;
        } else {
            currentChunk += (currentChunk ? '\n' : '') + line;
        }
    }

    if (currentChunk) {
        chunks.push(currentChunk);
    }

    return chunks;
}
