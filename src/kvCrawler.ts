import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const KV_URL = 'https://www.kv.ee/en/search?deal_type=3&county=1&view=gallery&orderby=cdwl';
const FOUND_HOUSES_FILE = path.join(__dirname, 'foundHouses.json');

interface House {
    title: string;
    url: string;
}

async function fetchHouses(): Promise<House[]> {
    try {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();

        // Listen for console events and log them to the Node.js console
        page.on('console', msg => {
            for (let i = 0; i < msg.args().length; ++i) {
                console.log(`${i}: ${msg.args()[i]}`);
            }
        });

        // Set a realistic user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        // Set other realistic settings
        await page.setViewport({ width: 1280, height: 800 });
        await page.setJavaScriptEnabled(true);
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
        });


        await page.goto(KV_URL, { waitUntil: 'networkidle2' });

        // Evaluate the page in the browser context to extract house data
        const houses: House[] = await page.evaluate(() => {
            const houseElements = document.querySelectorAll('.results > .object-type-house');
            const houseData: House[] = [];

            houseElements.forEach(element => {
                const titleElement = element.querySelector('.price');
                const title = titleElement ? titleElement.textContent?.trim() : '';
                const aTag = element.querySelector('a')
                const relativeUrl = aTag ? aTag.getAttribute('href') : '';
                const url = relativeUrl ? `https://www.kv.ee${relativeUrl}` : '';

                if (title && url) {
                    houseData.push({ title, url });
                }
            });

            return houseData;
        });

        await browser.close();
        return houses;
    } catch (error) {
        console.error('Error fetching data from kv.ee:', error);
        return [];
    }
}

function loadFoundHouses(): House[] {
    try {
        const data = fs.readFileSync(FOUND_HOUSES_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function saveFoundHouses(houses: House[]) {
    fs.writeFileSync(FOUND_HOUSES_FILE, JSON.stringify(houses, null, 2), 'utf-8');
}

export async function getNewHouses(): Promise<House[]> {
    const foundHouses = loadFoundHouses();
    const foundUrls = new Set(foundHouses.map(house => house.url));

    const houses = await fetchHouses();
    const newHouses = houses.filter(house => !foundUrls.has(house.url));

    if (newHouses.length > 0) {
        saveFoundHouses([...foundHouses, ...newHouses]);
    }

    return newHouses;
}
