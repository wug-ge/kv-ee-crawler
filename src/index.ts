import { getNewHouses } from './kvCrawler';
import { sendNewHouses } from './telegramBot';

async function main() {
    const newHouses = await getNewHouses();
    if (newHouses.length > 0) {
        await sendNewHouses(newHouses);
    } else {
        console.log('No new houses found.');
    }
}

main().catch(console.error);