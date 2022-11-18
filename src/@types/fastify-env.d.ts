import '@fastify/env'


declare module 'fastify' {
    interface FastifyInstance {
      config: { 
        SECRET:string;
      };
    }
  }