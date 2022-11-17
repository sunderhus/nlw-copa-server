import { prisma } from "@/lib/prisma";
import { authenticate } from "@/plugins/authenticate";
import { FastifyInstance } from "fastify";
import { string, z } from "zod";

export default async function authRoutes(fastify:FastifyInstance){
    fastify.get(
    '/me',
    {onRequest:[authenticate]},
    async(request)=>{
        return {user: request.user};
    });


    fastify.post('/auth',async (request)=>{

        const createUserBody = z.object({
            access_token:z.string(),
        }) 
        
        const {access_token} = createUserBody.parse(request.body);

        const oauthResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo',{
            method:'GET',
            headers:{
                Authorization:`Bearer ${access_token}`
            }
        })

        const userData = await oauthResponse.json();
        
        const userInforSchema = z.object({
            id:z.string(),
            name:string(),
            email:z.string().email(),
            picture:z.string().url(),
        })

        const userInfo = userInforSchema.parse(userData);


        let user = await prisma.user.findUnique({
            where:{
                googleId: userInfo.id,
            }
        });

        if(!user){
            user = await prisma.user.create({
                data:{
                  googleId:userInfo.id,
                  name:userInfo.name,
                  email:userInfo.email,
                  avatarUrl:userInfo.picture,  
                }
            });
        }

        const token = fastify.jwt.sign({
            name:user.name,
            avatarUrl:user.avatarUrl,
        },{
            sub:user.id,
            expiresIn:'7 days'
        });

        return{
            token
        }

    });
}

