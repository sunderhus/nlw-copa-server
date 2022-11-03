import Fastify from 'fastify'
import cors from '@fastify/cors'
import {PrismaClient} from 'prisma/prisma-client'


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

    await fastify.listen({port:3333, /*host:'0.0.0.0'*/});
}

bootStrap();