import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN as string);

export async function sendNewHouses(houses: { title: string; url: string; }[]) {
    const chatId = process.env.TELEGRAM_CHAT_ID as string;

    for (const house of houses) {
        const message = `${house.title}\n${house.url}`;
        await bot.telegram.sendMessage(chatId, message);
    }
}