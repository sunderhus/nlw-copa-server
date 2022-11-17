import cors from '@fastify/cors'
import jwt from '@fastify/jwt';
import Fastify from 'fastify'
import { FastifyInstance } from 'fastify';
import { pollRoutes,guessRoutes,userRoutes, authRoutes} from '@/routes';

type Route = (fastify: FastifyInstance)=> Promise<void>;

interface Params {
    routes:Route[];
    fastify: FastifyInstance;
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

    await fastify.register(cors,{
        origin:true
    });

    await fastify.register(jwt,{
        secret:'NLWCopaSecret',
    });
    
    await registerRoutes({
        fastify,
        routes:[
            authRoutes,
            userRoutes,
            pollRoutes,
            guessRoutes
        ]
    })

    await fastify.listen({
        port:3333,
        /*host:'0.0.0.0'*/
    });
}

bootStrap();