import { prisma } from "@/lib/prisma";
import crypto from 'crypto';
import { FastifyInstance } from "fastify";
import { z } from 'zod';


export default async function pollRoutes(fastify:FastifyInstance){
    fastify.get('/polls/count',async ()=>{
        const count = await prisma.poll.count()
    
        return {count}
    });


    fastify.post('/polls',async (request,reply)=>{
        const createPollBody = z.object({
            title:z.string(),
        });

        const {title} = createPollBody.parse(request.body);
        
        let ownerId = null;
        const code = crypto.randomUUID().toUpperCase();

        try{
            await request.jwtVerify()

            await prisma.poll.create({
                data:{
                    code,
                    title,
                    ownerId: request.user.sub,
                    
                    participants:{
                        create:{
                            userId: request.user.sub
                        }
                    }
                }
            })

        }catch{
            await prisma.poll.create({
                data:{
                    code,
                    title,
                }
            })
        }
        
        


        return reply.status(201).send({code})
    })
}
 