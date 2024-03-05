import express from 'express'
import { ulid } from 'ulid'
import listEndpoints from 'express-list-endpoints'
import pino from 'pino'
import { PrismaClient } from "@prisma/client";
import cors from 'cors'
import bodyParser from 'body-parser'
import createError from 'http-errors'
import voucher_codes from 'voucher-code-generator';

const app = express()
const port = 3000
const logger = pino()
app.use(cors())
app.use(bodyParser.json())

logger.info('Start api!')

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

app.put('/award/applied/accept', async (req, res) => {
  try {
    const body = req.body
    const prisma = new PrismaClient();
    const applied = await prisma.applied.findUnique({ where: { id: parseInt(body.id as string) } })
    if (!applied?.awardId) {
      throw new createError.NotFound('applicacion no tiene award id')
    }
    if (applied.accepted) {
      throw new createError.NotFound('applicacion ya fue aceptada')
    }
    if (applied.accepted === false) {
      throw new createError.NotFound('applicacion ya fue rechazada')
    }
    const award = await prisma.award.findUnique({ where: { id: applied.awardId } })
    if (!award) {
      throw new createError.NotFound('Award not found')
    }
    if (!award.toReddem) {
      throw new createError.BadRequest('Award not is null')
    }
    if (award.toReddem <= 0) {
      throw new createError.NotFound('Award reddems is 0 or less')
    }
    await prisma.award.update({
      where: { id: award.id },
      data: { toReddem: award.toReddem - 1 }
    })
    const code = voucher_codes.generate({
      length: 8,
      count: 1
    });
    const appliedUpdated = await prisma.applied.update({
      where: { id: applied.id },
      data: { accepted: true, code: code[0] }
    })
    res.json({ code: appliedUpdated.code })
    return
  } catch (error: any) {
    logger.error(error)
    res.status(400).json({ error: error.message })

  }
})
app.put('/award/applied/deny', async (req, res) => {
  try {
    const body = req.body
    const prisma = new PrismaClient();
    const applied = await prisma.applied.findUnique({ where: { id: parseInt(body.id as string) } })
    if (!applied?.awardId) {
      throw new createError.NotFound('applicacion no tiene award id')
    }
    const appliedUpdated = await prisma.applied.update({
      where: { id: applied.id },
      data: { accepted: false }
    })
    res.json(appliedUpdated)
    return
  } catch (error: any) {
    logger.error(error)
    res.status(400).json({ error: error.message })

  }
})
for (const endpoint of listEndpoints(app)) {
  logger.info(`${endpoint.methods} ${endpoint.path}`)
}
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
