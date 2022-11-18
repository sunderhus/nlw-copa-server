import cors from '@fastify/cors'
import jwt from '@fastify/jwt';
import Fastify from 'fastify'
import { FastifyInstance } from 'fastify';
import { pollRoutes,guessRoutes,userRoutes, authRoutes, gameRoutes} from '@/routes';
import fastifyEnv from '@fastify/env'

type Route = (fastify: FastifyInstance)=> Promise<void>;
interface Params {
    routes:Route[];
    fastify: FastifyInstance;
}

const envSchema = {
    type:'object',
    properties:{
        SECRET:{
            type:'string'
        }
    }
}


const registerRoutes =  async({fastify,routes}:Params)=>{
    routes.forEach(async (route) => {
        await fastify.register(route);
    });
}

async function bootStrap(){
    const fastify = Fastify({
        logger:true,
    });

    await fastify.register(fastifyEnv,{
        confKey:'config',
        schema:envSchema
    })

    await fastify.register(cors,{
        origin:true
    });

    await fastify.register(jwt,{
        secret:`${fastify.config.SECRET}`,
    });

    await registerRoutes({
        fastify,
        routes:[
            authRoutes,
            userRoutes,
            pollRoutes,
            guessRoutes,
            gameRoutes
        ]
    })

    await fastify.listen({
        port:3333,
        /*host:'0.0.0.0'*/
    });
}

bootStrap();