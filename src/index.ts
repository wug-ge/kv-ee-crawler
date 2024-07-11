import { getNewHouses } from './kvCrawler';
import { sendNewHouses } from './telegramBot';
import * as cron from 'node-cron'

async function main() {
  cron.schedule('* * * * *', async () => {  
      console.log("Crawling houses!")
      await crawlAndSend()
  })
  await crawlAndSend()
}

async function crawlAndSend() {
  const newHouses = await getNewHouses();
  if (newHouses.length > 0) {
    await sendNewHouses(newHouses);
  } else {
      console.log('No new houses found.');
  }
}

main().catch(console.error);