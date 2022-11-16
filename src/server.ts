import Fastify from 'fastify'
import cors from '@fastify/cors'
import {PrismaClient} from 'prisma/prisma-client'
import crypto from 'crypto';
import{z} from 'zod'

const prisma = new PrismaClient({
    log:['query']
});

async function bootStrap(){
    const fastify = Fastify({
        logger:true,
    });

    await fastify.register(cors,{
        origin:true
    });

    fastify.get('/users/count',async ()=>{
        const count = await prisma.user.count()

        return {count}
    });

    fastify.get('/guesses/count',async()=>{
        const count = await prisma.guess.count()

        return {count}
    })
    
    fastify.get('/poll/count',async ()=>{
        const count = await prisma.poll.count()

        return {count}
    });

    fastify.post('/poll',async (request,reply)=>{
        const createPollBody = z.object({
            title:z.string(),
        });

        const {title} = createPollBody.parse(request.body);
        const code = crypto.randomUUID().toUpperCase();
        await prisma.poll.create({
            data:{
                code,
                title,
            }
        })


        return reply.status(201).send({code})
    })

    await fastify.listen({port:3333, /*host:'0.0.0.0'*/});
}

bootStrap();