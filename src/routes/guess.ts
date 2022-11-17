import { prisma } from "@/lib/prisma";
import { authenticate } from "@/plugins/authenticate";
import { FastifyInstance } from "fastify";
import {  z } from "zod";

export default async function guessRoutes(fastify: FastifyInstance) {

    fastify.get('/guesses/count', async () => {
        const count = await prisma.guess.count()

        return { count }
    });;

    fastify.post('/guesses/:pollId/games/:gameId', {
        onRequest: [authenticate]
    },
        async (request, reply) => {
            const createGuessSchema = z.object({
                pollId: z.string(),
                gameId: z.string(),
            })

            const createGuessBodySchema = z.object({
                firstTeamPoints: z.number(),
                secondTeamPoints: z.number(),
            })

            const { pollId, gameId } = createGuessSchema.parse(request.params)
            const { firstTeamPoints, secondTeamPoints } = createGuessBodySchema.parse(request.body);


            const participant = await prisma.participant.findUnique({
                where: {
                    userId_pollId: {
                        pollId,
                        userId: request.user.sub
                    }
                }
            });

            if (!participant) {
                return reply.status(400).send({
                    message: "You are not allowed to create a guess in this poll."
                })
            }

            const guess = await prisma.guess.findUnique({
                where: {
                    participantId_gameId: {
                        participantId: participant.id,
                        gameId
                    }
                }
            })

            if (guess) {
                return reply.status(400).send({
                    message: "You already sent a guess to this game."
                });
            }

            const game = await prisma.game.findUnique({
                where: {
                    id: gameId
                }
            })

            if (!game) {
                return reply.status(400).send({
                    message: "Game not found."
                });
            }

            if (game.date < new Date()) {
                return reply.status(400).send({
                    message: "This game already end."
                });
            }

            await prisma.guess.create({
                data:{
                    gameId,
                    participantId:participant.id,
                    firstTeamPoints,
                    secondTeamPoints,
                }
            });

            return reply.status(201).send()

        })

}

