import axios from 'axios';
import fs from 'fs';
import path from 'path';

const KV_URL = 'https://www.kv.ee/en/search&orderby=ob&deal_type=1&county=1&parish=1061';
const LAST_CRAWL_FILE = path.join(__dirname, '../lastCrawl.json');

interface House {
    id: string;
    title: string;
    url: string;
    date_activated: string;
}

async function fetchHouses(): Promise<House[]> {
    try {
        const { data } = await axios.get(KV_URL, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0',
          }
        });
        return data.objects.map((item: any) => ({
            id: item.object_id,
            title: `${item.price_eur}€`,
            url: `https://www.kv.ee/${item.object_id}`,
            date_activated: item.date_activated,
        }));
    } catch (error) {
        console.error('Error fetching data from kv.ee:', error);
        return [];
    }
}

function getLastCrawlTime(): Date {
    try {
        const lastCrawlData = fs.readFileSync(LAST_CRAWL_FILE, 'utf-8');
        const { lastCrawl } = JSON.parse(lastCrawlData);
        return new Date(lastCrawl);
    } catch (error) {
        return new Date(0); // Return epoch if no last crawl time found
    }
}

function saveLastCrawlTime() {
    const lastCrawl = new Date().toISOString();
    fs.writeFileSync(LAST_CRAWL_FILE, JSON.stringify({ lastCrawl }), 'utf-8');
}

export async function getNewHouses(): Promise<House[]> {
    const lastCrawlTime = getLastCrawlTime();
    const houses = await fetchHouses();

    const newHouses = houses.filter(house => new Date(house.date_activated) > lastCrawlTime);
    saveLastCrawlTime();

    return newHouses;
}