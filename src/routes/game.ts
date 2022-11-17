import { prisma } from "@/lib/prisma";
import { authenticate } from "@/plugins/authenticate";
import { FastifyInstance } from "fastify";
import { z } from "zod";

export default async function gameRoutes(fastify:FastifyInstance){
    
    fastify.get('/game/:id',
    {
        onRequest:[authenticate]
    }
    ,async(request)=>{
        const getPollParams = z.object({
            id:z.string(),
        })

        const {id} = getPollParams.parse(request.params);

        const games = await prisma.game.findMany({
            orderBy:{
                date:'desc'
            },
            include:{
                guesses:{
                    where:{
                        participant:{
                            userId:request.user.sub,
                            pollId:id
                        },
                    }
                }
            }
        });

        return {
            games: games.map(game=>({
                ...game,
                guess:game.guesses.length>0 ? game.guesses[0]:null,
                guesses:undefined,
            }))

        };
    })
    
}
