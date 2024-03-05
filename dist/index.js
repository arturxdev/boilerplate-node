"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_list_endpoints_1 = __importDefault(require("express-list-endpoints"));
const pino_1 = __importDefault(require("pino"));
const client_1 = require("@prisma/client");
const app = (0, express_1.default)();
const port = 3000;
const logger = (0, pino_1.default)();
logger.info('Hello, World!');
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.get('/campaign/award', async (req, res) => {
    const params = req.query;
    const prisma = new client_1.PrismaClient();
    const result = await prisma.awardCampaign.findMany({
        include: {
            award: true,
        },
        where: { campaignId: parseInt(params.campaignId) }
    });
    res.json(result);
    return;
});
app.get('/company/award', async (req, res) => {
    const params = req.query;
    const prisma = new client_1.PrismaClient();
    const result = await prisma.campaign.findMany({
        include: {
            awardCampaign: { include: { award: true } }
        },
        where: { companyId: parseInt(params.companyId) }
    });
    res.json(result);
    return;
});
for (const endpoint of (0, express_list_endpoints_1.default)(app)) {
    logger.info(`${endpoint.methods} ${endpoint.path}`);
}
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
//# sourceMappingURL=index.js.map