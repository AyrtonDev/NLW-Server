import express, { Express, Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { PrismaClient } from '@prisma/client'
import {
    convertHoursAndMinutes,
    convertMinutesAndHours,
} from './utils/convertTime'

const port = 3333

dotenv.config()

const app: Express = express()

app.use(express.json())
app.use(cors())

const prisma = new PrismaClient({
    log: ['query'],
})

app.get('/games', async (req: Request, res: Response) => {
    const games = await prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true,
                },
            },
        },
    })

    return res.json(games)
})

app.post('/games/:id/ads', async (req: Request, res: Response) => {
    const gameId = req.params.id
    const body = req.body

    const ad = await prisma.ad.create({
        data: {
            gameId,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekDays: body.weekDays.join(','),
            hourStart: convertHoursAndMinutes(body.hourStart),
            hourEnd: convertHoursAndMinutes(body.hourEnd),
            useVoiceChannel: body.useVoiceChannel,
        },
    })

    return res.status(201).json(ad)
})

app.get('/games/:id/ads', async (req: Request, res: Response) => {
    const gameId = req.params.id
    const ads = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            weekDays: true,
            useVoiceChannel: true,
            yearsPlaying: true,
            hourEnd: true,
            hourStart: true,
        },
        where: {
            gameId,
        },
        orderBy: {
            createdAt: 'desc',
        },
    })

    return res.json(
        ads.map((ad) => ({
            ...ad,
            weekDays: ad.weekDays.split(','),
            hourStart: convertMinutesAndHours(ad.hourStart),
            hourEnd: convertMinutesAndHours(ad.hourEnd),
        }))
    )
})

app.get('/ads/:id/discord', async (req: Request, res: Response) => {
    const adId = req.params.id

    const ad = await prisma.ad.findUniqueOrThrow({
        select: {
            discord: true,
        },
        where: {
            id: adId,
        },
    })

    return res.json({
        discord: ad?.discord,
    })
})

app.listen(port, () => {
    console.log(`[server]: Server is running at https://localhost:${port}`)
})
