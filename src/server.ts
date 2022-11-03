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
    
    fastify.get('/pools/count',async ()=>{
        const count = await prisma.pool.count()

        return {count}
    });

    fastify.post('/pools',async (request,reply)=>{
        const createPoolBody = z.object({
            title:z.string(),
        });

        const {title} = createPoolBody.parse(request.body);
        const code = crypto.randomUUID().toUpperCase();
        await prisma.pool.create({
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