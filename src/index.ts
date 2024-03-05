import express from 'express'
import listEndpoints from 'express-list-endpoints'
import pino from 'pino'
import { PrismaClient } from "@prisma/client";

const app = express()
const port = 3000
// const logger = pino()

// logger.info('Start api!')

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.get('/campaign/award', async (req, res) => {
  const params = req.query
  const prisma = new PrismaClient();
  const result = await prisma.awardCampaign.findMany({
    include: {
      award: true,
    },
    where: { campaignId: parseInt(params.campaignId as string) }
  })
  res.json(result)
  return
})
app.get('/company/award', async (req, res) => {
  const params = req.query
  const prisma = new PrismaClient();
  const result = await prisma.campaign.findMany({
    include: {
      awardCampaign: { include: { award: true } }
    },
    where: { companyId: parseInt(params.companyId as string) }
  })
  res.json(result)
  return
})

// for (const endpoint of listEndpoints(app)) {
//   logger.info(`${endpoint.methods} ${endpoint.path}`)
// }
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
