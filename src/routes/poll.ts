import { prisma } from "@/lib/prisma";
import { authenticate } from "@/plugins/authenticate";
import crypto from 'crypto';
import { FastifyInstance } from "fastify";
import { z } from 'zod';


export default async function pollRoutes(fastify: FastifyInstance) {
    fastify.get('/polls/count', async () => {
        const count = await prisma.poll.count()

        return { count }
    });


    fastify.post('/polls', async (request, reply) => {
        const createPollBody = z.object({
            title: z.string(),
        });

        const { title } = createPollBody.parse(request.body);

        let ownerId = null;
        const code = crypto.randomUUID().toUpperCase();

        try {
            await request.jwtVerify()

            await prisma.poll.create({
                data: {
                    code,
                    title,
                    ownerId: request.user.sub,

                    participants: {
                        create: {
                            userId: request.user.sub
                        }
                    }
                }
            })

        } catch {
            await prisma.poll.create({
                data: {
                    code,
                    title,
                }
            })
        }




        return reply.status(201).send({ code })
    });


    fastify.post('/polls/join',
        {
            onRequest: [authenticate]
        },
        async (request, reply) => {
            const joinPollSchema = z.object({
                code: z.string(),
            })

            const { code } = joinPollSchema.parse(request.body);


            const poll = await prisma.poll.findUnique({
                where: {
                    code
                },
                include: {
                    participants: {
                        where: {
                            userId: request.user.sub
                        }
                    }
                }
            });

            if (!poll) {
                return reply.status(404).send({
                    message: 'Poll not found',
                })
            }


            if (poll.participants.length > 0) {
                return reply.status(400).send({
                    message: 'You already join this poll.',
                })
            }

            if (!poll.ownerId) {
                await prisma.poll.update({
                    where: {
                        id: poll.id
                    },
                    data: {
                        ownerId: request.user.sub
                    }
                })
            }


            await prisma.participant.create({
                data: {
                    pollId: poll.id,
                    userId: request.user.sub
                }
            })


            return reply.status(201).send();
        });


    fastify.get('/polls', {
        onRequest: [authenticate]
    }, async (request) => {
        const polls = await prisma.poll.findMany({
            where: {
                participants: {
                    some: {
                        userId: request.user.sub,
                    }
                }
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                avatarUrl: true,
                            }
                        }
                    },
                    take: 4,
                },
                _count: {
                    select: {
                        participants: true
                    }
                },
                owner: {
                    select: {
                        name: true,
                        id: true
                    }
                }
            }
        });

        return {
            polls
        }
    });


    fastify.get('/polls/:id',
    {
        onRequest:[authenticate]
    }
    ,async (request)=>{
        const getPollParams = z.object({
            id:z.string(),
        })

        const {id} = getPollParams.parse(request.params);


        const poll = await prisma.poll.findUnique({
            where: {
                id:id
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                avatarUrl: true,
                            }
                        }
                    },
                    take: 4,
                },
                _count: {
                    select: {
                        participants: true
                    }
                },
                owner: {
                    select: {
                        name: true,
                        id: true
                    }
                }
            }
        });


        return{
            poll
        }

    });

}
